import PiscinaModule from 'piscina';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const moduleUrl = import.meta.url;
const __filename = fileURLToPath(moduleUrl);
const __dirname = path.dirname(__filename);
type PiscinaClassType = typeof PiscinaModule.Piscina;
type PiscinaInstance = InstanceType<PiscinaClassType>;


export class WorkerManager {
    private pool:PiscinaInstance;
    private _state: EWorkerManagerState = EWorkerManagerState.Ready;



    public constructor() {
        this.pool = new PiscinaModule.Piscina({
            filename: path.resolve(__dirname, 'MatrixCalculator.ts'),
            minThreads: Math.floor(os.availableParallelism() / 2),
            maxThreads: os.availableParallelism(),
            idleTimeout: 10000,
        });

        console.log(`WorkerManager initialized; Threads: ${this.pool.options.minThreads} to ${this.pool.options.maxThreads}.`);
        this._state = EWorkerManagerState.Running;
    }

    public async submit(task: any, signal: AbortSignal): Promise<any> {

        if (signal == null) {
            throw new Error('Abort signal is required.');
        }

        if (this._state == EWorkerManagerState.Retired) {
            throw new Error('WorkerManager is already retired.');
        }


        return this.pool.run(task, {signal: signal});
    }

    public async destroy(): Promise<void> {
        if (this._state == EWorkerManagerState.Retired){
            throw new Error('WorkerManager is already retired.');
        }


        await this.pool.destroy();
        this._state = EWorkerManagerState.Retired;
    }
}

enum EWorkerManagerState {
    Ready = 0,
    Running = 1,
    Retired = 2,
}