import {BaseUpdatable} from "./Updatable.js";

export class UpdatableTestMock extends BaseUpdatable{
    private _complete: boolean = false;
    get Complete(): boolean {
        return this._complete;
    }
    set Complete(value: boolean) {
        this._complete = value;
    }

    protected OnUpdate(deltaTime: number): void {
        this.Complete = true;
    }

}