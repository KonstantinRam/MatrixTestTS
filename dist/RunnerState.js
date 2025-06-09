import { z } from "zod";
export var RunnerState;
(function (RunnerState) {
    RunnerState[RunnerState["Ready"] = 0] = "Ready";
    RunnerState[RunnerState["Running"] = 1] = "Running";
    RunnerState[RunnerState["Retired"] = 2] = "Retired";
    RunnerState[RunnerState["Paused"] = 3] = "Paused";
})(RunnerState || (RunnerState = {}));
export const RunnerStateSchema = z.nativeEnum(RunnerState);
//# sourceMappingURL=RunnerState.js.map