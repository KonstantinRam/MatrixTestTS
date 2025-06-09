import {BaseSystemRunner} from "./SystemRunner.js";
import {BaseDispenser, EDispatcherRequest} from "./Dispencer.js";
import {Stopwatch} from "./Stopwatch.js";
import {delay} from "./utils.js";
import {WorkerManager} from "./WorkerManager.js";
import { BasicMatrixResult, MatrixTask} from "./MatrixCalculator.js";

(async () => {
    try {

        console.log("Performing initial async setup...");
        let abortController = new AbortController();


        let workerManager = new WorkerManager();
        let request ={ id: "FakeID", requests: [EDispatcherRequest.Ticker]};

        let sw = new Stopwatch();
        sw.start();
        let result = await workerManager.submit(request, abortController.signal);

        sw.stop();
        console.log(`Work complete in ${sw.getTime()} ms.`);

        for (const cycle of result.stringResult) {
            console.log(cycle);
        }
    } catch (error) {
        console.error("An error occurred in the main execution:", error);

        process.exitCode = 1;
    }
})();

export { };
