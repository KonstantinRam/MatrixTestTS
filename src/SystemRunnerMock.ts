import {SystemRunner} from "./SystemRunner.interfaces.js";
import {Updatable} from "./Updatable.interfaces.js";

export class SystemRunnerMock  implements SystemRunner{

    private _counter: number = 0;

    public getTasksAmount(): number {
        return this._counter;
    }

    public hasAnyTasks(): boolean {
        return this._counter > 0;
    }

    public push(newUpdatable: Updatable): void;
    public push(newUpdatable: Iterable<Updatable>): void;
    public push(newUpdatable: Updatable | Iterable<Updatable>): void {
        if (typeof (newUpdatable as any)[Symbol.iterator] === 'function' && typeof (newUpdatable as Updatable).update !== 'function') {
            for (const updatable of newUpdatable as Iterable<Updatable>) {
                this._counter++;
            }
        } else {
            this._counter++;
        }
    }

}