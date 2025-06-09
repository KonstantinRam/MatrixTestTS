import {BaseDispenser, EDispatcherRequest} from "./Dispencer.js";
import {BaseSystemRunner} from "./SystemRunner.js";
import {Stopwatch} from "./Stopwatch.js";
import {delay} from "./utils.js";
import {z} from "zod";

export interface MatrixTask {
    id: string;
    requests : EDispatcherRequest[];
}
/*
export const MatrixTaskSchema = z.object({
    id: z.string(),
    requests: z.array(z.enum(EDispatcherRequest))
})
*/
/*
export class BaseMatrixTask implements MatrixTask {
    id: string;
    requests : EDispatcherRequest[];
    constructor(id: string, requests: EDispatcherRequest[]) {
        this.id = id;
        this.requests = requests;
    }
}
*/
export interface MatrixResult {
    taskId: string;
    stringResult: string[];
}

export class BasicMatrixResult implements MatrixResult{
    taskId: string;
    stringResult: string[] = [];

    constructor(taskId: string) {
        this.taskId = taskId;

    }
}

export default async function generate(payload: MatrixTask): Promise<MatrixResult> {

            let localAbortController = new AbortController();
            let signal = localAbortController.signal;
            let result = new BasicMatrixResult(payload.id);



                if (signal instanceof (AbortSignal)) {
                    console.log("Abort signal received.");
                }


                let systemRunnerCreation = BaseSystemRunner.create({deltaTimeMs: 10, abortSignal: signal});
    console.log("ii.");
                if (!systemRunnerCreation.success) {
                    throw new Error("System runner creation failed.");
                }
                let systemRunner: BaseSystemRunner;

                systemRunner = systemRunnerCreation.systemRunner as BaseSystemRunner;
    console.log("br.");

                systemRunner.onCycleDone((cycleReport) => {
                    result.stringResult.push(cycleReport.ToString());
                })

                let dispenserCreation = BaseDispenser.create({
                    systemRunner: systemRunner,
                    delayTimeMs: 5,
                    runner: null,
                    abortSignal: signal
                });
    console.log("dr.");
                if (!dispenserCreation.success) {
                    throw new Error("Dispenser creation failed.");
                }

                let dispenser = dispenserCreation.dispenser;


                for (const request of payload.requests) {
                    dispenser.request(EDispatcherRequest.Ticker);
                }
    console.log("ur.");

                let sw = new Stopwatch();
                sw.start();

                systemRunner.start();

                console.log("Initial setup complete.");

    console.log("tr.");

                await delay(10);

                while (systemRunner.hasAnyTasks() || dispenser.hasPendingRequest()) {
                    await delay(10);
                }

    console.log("cr.");
                dispenser.stop();
                systemRunner.stop();
                sw.stop();
                console.log(`Work complete in ${sw.getTime()} ms.`);

                return result;

}