import {Runner} from "./Runner.interfaces.js";
import {z} from "zod";
import {RunnerStateManager} from "./RunnerStateManager.js";
import {RunnerState} from "./RunnerState.js";
import {AsyncVoidFunction, delay} from "./utils.js";



export const RunnerConstructionSchema = z.object({
    debugId: z.string().nonempty("Debug ID must be provided." ),
    abortSignal: z.instanceof(AbortSignal),
})
type RunnerConstructionParams = z.infer<typeof RunnerConstructionSchema>;

export type CreateRunnerSuccess = {
    success: true;
    runner: Runner;
};

export type CreateRunnerFailure = {
    success: false;
    errors: z.ZodIssue[];
};

export class BaseRunner implements Runner {

    public static create(params: RunnerConstructionParams): CreateRunnerSuccess | CreateRunnerFailure {
        const validationResult = RunnerConstructionSchema.safeParse(params);

        if (!validationResult.success) {
            console.error(`Runner parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            return { success: false, errors: validationResult.error.issues };
        }
        let result = new BaseRunner(params.debugId, params.abortSignal);
        return {success: true, runner: result};

    }

    private constructor(debugId: string, abortSignal: AbortSignal) {
        this._debugId = debugId;

        this._internalController = new AbortController();
        const signalsToCombine = [this._internalController.signal];
        if (abortSignal) {
            signalsToCombine.push(abortSignal);
        }

        this._abortSignal = AbortSignal.any(signalsToCombine);
    }
    private readonly _internalController: AbortController;
    private readonly _abortSignal: AbortSignal;
    private _longPromise: Promise<void> | null = null;
    private _runnerState: RunnerStateManager = new RunnerStateManager();
    private _inLoop: AsyncVoidFunction | null = null;
    private _inIdle: AsyncVoidFunction | null = null;
    private readonly _debugId: string;

    public getState(): RunnerState {
        return this._runnerState.Current();
    }

    public pause(): void {
    }

    public resume(): void {
    }

    public start(): void {
        if (!this.workAssigned() ) {
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
        console.log(`Starting ${this._debugId}  ${this._abortSignal === null ? "without" : "with"} abort signal. Current state: ${this.getState()}`);
        console.log(`Abort signal: ${ this._inLoop}  ${this._inIdle}`);

        this._longPromise = this.executeLoop(this._abortSignal, this._inLoop, this._inIdle);

        this._longPromise.catch(error => {
            if (error.name === 'AbortError') {

                throw new Error(`Unexpected Error; Attempt to start ${this._debugId}, but abort signal was triggered. Error: ${error.message}`);
            }
        });
    }

    public stop(): void {
        if (this.getState() !== RunnerState.Running && this.getState() !== RunnerState.Paused) {
            console.warn(`Attempt to stop ${this._debugId} while state is ${this.getState()}.`);
            return;
        }
        if (this._longPromise == null) {
            throw new Error(`Attempt to stop ${this._debugId}, but no loop was started.`);
        }
        if (this._abortSignal.aborted)
        {
            return;
        }

        this._runnerState.Set(RunnerState.Retired);
        this._internalController?.abort();
    }


    public assign(inLoop: AsyncVoidFunction, inIdle: AsyncVoidFunction): void {
        this._inLoop = inLoop;
        this._inIdle = inIdle;
    }

    public workAssigned(): boolean {
        return !!this._inLoop && !!this._inIdle;
    }

    private async executeLoop(signal: AbortSignal, inLoop: AsyncVoidFunction, inIdle: AsyncVoidFunction ): Promise<void> {

        try {

            while (!signal.aborted) {
                signal.throwIfAborted();

                if (this.getState() === RunnerState.Running && this._inLoop) {
                    await inLoop();

                } else if (this.getState() !== RunnerState.Running && this.getState() !== RunnerState.Paused) {
                   // Unexpected error. Loop should be stopped.
                   break;
                }

                await inIdle();
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                //just exit
                return;
            }

            throw error;
        }
    }


}