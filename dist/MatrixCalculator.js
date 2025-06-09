import { BaseDispenser, EDispatcherRequest } from "./Dispencer.js";
import { BaseSystemRunner } from "./SystemRunner.js";
import { Stopwatch } from "./Stopwatch.js";
import { delay } from "./utils.js";
export class BasicMatrixResult {
    taskId;
    stringResult = [];
    constructor(taskId) {
        this.taskId = taskId;
    }
}
export default async function generate(payload) {
    let localAbortController = new AbortController();
    let signal = localAbortController.signal;
    let result = new BasicMatrixResult(payload.id);
    if (signal instanceof (AbortSignal)) {
        console.log("Abort signal received.");
    }
    let systemRunnerCreation = BaseSystemRunner.create({ deltaTimeMs: 10, abortSignal: signal });
    if (!systemRunnerCreation.success) {
        throw new Error("System runner creation failed.");
    }
    let systemRunner;
    systemRunner = systemRunnerCreation.systemRunner;
    systemRunner.onCycleDone((cycleReport) => {
        result.stringResult.push(cycleReport.ToString());
    });
    let dispenserCreation = BaseDispenser.create({
        systemRunner: systemRunner,
        delayTimeMs: 5,
        runner: null,
        abortSignal: signal
    });
    if (!dispenserCreation.success) {
        throw new Error("Dispenser creation failed.");
    }
    let dispenser = dispenserCreation.dispenser;
    for (const request of payload.requests) {
        dispenser.request(EDispatcherRequest.Ticker);
    }
    let sw = new Stopwatch();
    sw.start();
    systemRunner.start();
    console.log("Initial setup complete.");
    await delay(10);
    while (systemRunner.hasAnyTasks() || dispenser.hasPendingRequest()) {
        await delay(10);
    }
    dispenser.stop();
    systemRunner.stop();
    sw.stop();
    console.log(`Work complete in ${sw.getTime()} ms.`);
    return result;
}
//# sourceMappingURL=MatrixCalculator.js.map