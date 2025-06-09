import { BaseUpdatable } from "./Updatable.js";
export class UpdatableTestMock extends BaseUpdatable {
    _complete = false;
    get Complete() {
        return this._complete;
    }
    set Complete(value) {
        this._complete = value;
    }
    OnUpdate(deltaTime) {
        this.Complete = true;
    }
}
//# sourceMappingURL=UpdatableMock.js.map