import { z } from "zod";
import { RunnerStateManager } from "./RunnerStateManager.js";
import { RunnerState } from "./RunnerState.js";
export const RunnerConstructionSchema = z.object({
    debugId: z.string().nonempty("Debug ID must be provided."),
    abortSignal: z.instanceof(AbortSignal),
});
export class BaseRunner {
    static create(params) {
        const validationResult = RunnerConstructionSchema.safeParse(params);
        if (!validationResult.success) {
            console.error(`Runner parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            return { success: false, errors: validationResult.error.issues };
        }
        let result = new BaseRunner(params.debugId, params.abortSignal);
        return { success: true, runner: result };
    }
    constructor(debugId, abortSignal) {
        this._debugId = debugId;
        this._internalController = new AbortController();
        const signalsToCombine = [this._internalController.signal];
        if (abortSignal) {
            signalsToCombine.push(abortSignal);
        }
        this._abortSignal = AbortSignal.any(signalsToCombine);
    }
    _internalController;
    _abortSignal;
    _longPromise = null;
    _runnerState = new RunnerStateManager();
    _inLoop = null;
    _inIdle = null;
    _debugId;
    getState() {
        return this._runnerState.Current();
    }
    pause() {
    }
    resume() {
    }
    start() {
        if (!this.workAssigned()) {
            throw new Error(`Attempt to start a ${this._debugId}, however no work was assigned.`);
        }
        if (this.getState() !== RunnerState.Ready) {
            console.warn(`Attempt to start ${this._debugId} while state is ${this.getState()}`);
            return;
        }
        if (this._longPromise !== null) {
            console.warn(`Attempt to start ${this._debugId}, however a task is already running.`);
            return;
        }
        this._runnerState.Set(RunnerState.Running);
        if (this._inLoop == null || this._inIdle == null) {
            throw new Error(`Unexpected Error; Attempt to start ${this._debugId}, however no work was assigned, but workAssigned check was passed.`);
        }
        this._longPromise = this.executeLoop(this._abortSignal, this._inLoop, this._inIdle);
        this._longPromise.catch(error => {
            if (error.name === 'AbortError') {
                throw new Error(`Unexpected Error; Attempt to start ${this._debugId}, but abort signal was triggered. Error: ${error.message}`);
            }
        });
    }
    stop() {
        if (this.getState() !== RunnerState.Running && this.getState() !== RunnerState.Paused) {
            console.warn(`Attempt to stop ${this._debugId} while state is ${this.getState()}.`);
            return;
        }
        if (this._longPromise == null) {
            throw new Error(`Attempt to stop ${this._debugId}, but no loop was started.`);
        }
        if (this._abortSignal.aborted) {
            return;
        }
        this._runnerState.Set(RunnerState.Retired);
        this._internalController?.abort();
    }
    assign(inLoop, inIdle) {
        this._inLoop = inLoop;
        this._inIdle = inIdle;
    }
    workAssigned() {
        return !!this._inLoop && !!this._inIdle;
    }
    async executeLoop(signal, inLoop, inIdle) {
        try {
            while (!signal.aborted) {
                signal.throwIfAborted();
                if (this.getState() === RunnerState.Running && this._inLoop) {
                    await inLoop();
                }
                else if (this.getState() !== RunnerState.Running && this.getState() !== RunnerState.Paused) {
                    // Unexpected error. Loop should be stopped.
                    break;
                }
                await inIdle();
            }
        }
        catch (error) {
            if (error.name === 'AbortError') {
                //just exit
                return;
            }
            throw error;
        }
    }
}
//# sourceMappingURL=Runner.js.map