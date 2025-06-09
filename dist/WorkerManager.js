//import PiscinaModule from 'piscina';
//import Piscina from 'piscina';
//import PiscinaConstructor from 'piscina';
import PiscinaModule from 'piscina';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
const moduleUrl = import.meta.url;
const __filename = fileURLToPath(moduleUrl);
const __dirname = path.dirname(__filename);
export class WorkerManager {
    //private pool: PiscinaModule.default;
    pool;
    _state = EWorkerManagerState.Ready;
    constructor() {
        this.pool = new PiscinaModule.Piscina({
            filename: path.resolve(__dirname, 'MatrixCalculator.ts'),
            minThreads: Math.floor(os.availableParallelism() / 2),
            maxThreads: os.availableParallelism(),
            idleTimeout: 10000,
        });
        console.log(`WorkerManager initialized; Threads: ${this.pool.options.minThreads} to ${this.pool.options.maxThreads}.`);
        this._state = EWorkerManagerState.Running;
    }
    async submit(task, signal) {
        if (signal == null) {
            throw new Error('Abort signal is required.');
        }
        if (this._state == EWorkerManagerState.Retired) {
            throw new Error('WorkerManager is already retired.');
        }
        return this.pool.run(task, { signal: signal });
    }
    async destroy() {
        if (this._state == EWorkerManagerState.Retired) {
            throw new Error('WorkerManager is already retired.');
        }
        await this.pool.destroy();
        this._state = EWorkerManagerState.Retired;
    }
}
var EWorkerManagerState;
(function (EWorkerManagerState) {
    EWorkerManagerState[EWorkerManagerState["Ready"] = 0] = "Ready";
    EWorkerManagerState[EWorkerManagerState["Running"] = 1] = "Running";
    EWorkerManagerState[EWorkerManagerState["Retired"] = 2] = "Retired";
})(EWorkerManagerState || (EWorkerManagerState = {}));
//# sourceMappingURL=WorkerManager.js.map