import {RunnerState} from "./RunnerState.js";

export class RunnerStateManager {

    private _runnerState: RunnerState = RunnerState.Ready;
   public Current () : RunnerState {
       return this._runnerState;
   }

   public Set (state: RunnerState) : void {
       this._runnerState = state;
   }
}