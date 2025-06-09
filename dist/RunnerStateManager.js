import { RunnerState } from "./RunnerState.js";
export class RunnerStateManager {
    _runnerState = RunnerState.Ready;
    Current() {
        return this._runnerState;
    }
    Set(state) {
        this._runnerState = state;
    }
}
//# sourceMappingURL=RunnerStateManager.js.map