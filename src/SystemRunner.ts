import {SystemRunner} from "./SystemRunner.interfaces.js";
import {Updatable, ValueUpdatable} from "./Updatable.interfaces.js";
import {UpdatableStorage} from "./UpdatableStorage.js";
import {z} from "zod";
import {Runner, RunnerSchema} from "./Runner.interfaces.js";
import {BaseRunner} from "./Runner.js";
import {delay} from "./utils.js";
import {RunnerState} from "./RunnerState.js";
import {Ticker} from "./Ticker.js";
import {Mover} from "./Mover.js";
import {CycleReport} from "./CycleReport.interfaces.js";
import {BaseCycleReport} from "./CycleReport.js";




export const SystemRunnerConstructionSchema = z.object({
    deltaTimeMs: z.number(),
    abortSignal: z.instanceof(AbortSignal),
    runner : RunnerSchema.nullish(),

}).refine(data => data.deltaTimeMs > 0, {message: "Delta time must be greater than 0" })

type OnCycleDone = (cycleReport : CycleReport) => void;

type SystemRunnerConstructionParams = z.infer<typeof SystemRunnerConstructionSchema>;

export type CreateSystemRunnerSuccess = {
    success: true;
    systemRunner: SystemRunner;
};

export type CreateSystemRunnerFailure = {
    success: false;
    errors: z.ZodIssue[];
};

export type CreateSystemRunnerResult = CreateSystemRunnerSuccess | CreateSystemRunnerFailure;

const SINGLE_CYCLE_TIMELAPSE_MS = 17;

export class BaseSystemRunner implements SystemRunner {

    public static create(params: SystemRunnerConstructionParams): CreateSystemRunnerResult {
        const workingParams = { ...params };

        if (workingParams.runner == null) {
            let defaultRunner = BaseRunner.create({debugId: "SystemRunner runner", abortSignal: params.abortSignal});
            if (!defaultRunner.success)
            {
                console.error(`Failed to create default runner:`);
                return {success: false, errors: defaultRunner.errors};
            }
            let dedicatedDefaultRunnerParse = RunnerSchema.safeParse(defaultRunner.runner);
            if (!dedicatedDefaultRunnerParse.success) {
                console.error(`Default runner failed validation:`, dedicatedDefaultRunnerParse.error.flatten().fieldErrors);
                return { success: false, errors: dedicatedDefaultRunnerParse.error.issues };
            }
            workingParams.runner = defaultRunner.runner;
        }

        const validationResult = SystemRunnerConstructionSchema.safeParse(workingParams);
        if (!validationResult.success) {
            console.error(`SystemRunner parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            console.log(validationResult.error.issues);
            return { success: false, errors: validationResult.error.issues };
        }

        let result = new BaseSystemRunner(workingParams.deltaTimeMs, workingParams.runner, workingParams.abortSignal);
        return {success: true, systemRunner: result};
    }

    private constructor(deltaTimeMs: number, runner : Runner, abortSignal: AbortSignal) {

        this._runner = runner;
        this._abortSignal = abortSignal;

        this._runner.assign(
          async ()=>
          {

            //  let sw = new Stopwatch();
           //   sw.start();
              this.processUpdatable (deltaTimeMs);
             // await delay(this._toSleep, true, this._abortSignal);
            //  sw.stop();
          },

          async ()=>
          {
              await delay(this._toSleep, true, this._abortSignal);
          }
        );
    }

    private readonly _storage = new UpdatableStorage();
    private readonly _runner: Runner;
    private readonly _abortSignal: AbortSignal;
    private _toSleep : number = 1;//SINGLE_CYCLE_TIMELAPSE_MS;
    private _onCycleDone: OnCycleDone | null = null;

    public onCycleDone (onCycleDone: OnCycleDone) : void
    {
        this._onCycleDone = onCycleDone;
    }

    public getTasksAmount(): number {
        return this._storage.count();
    }

    public hasAnyTasks(): boolean {
        return this._storage.any();
    }

    public push(newUpdatable: Updatable): void ;
    public push(newUpdatable: Iterable<Updatable>): void;
    public push(newUpdatable: Updatable | Iterable<Updatable>): void {

        if (typeof (newUpdatable as any)[Symbol.iterator] === 'function' && typeof (newUpdatable as Updatable).update !== 'function') {
            for (const updatable of newUpdatable as Iterable<Updatable>) {
                this.pushSingle(updatable);
            }
        } else {
            this.pushSingle(newUpdatable as Updatable);
        }
    }

    private pushSingle(newUpdatable: Updatable): void {
        this._storage.add(newUpdatable);
        newUpdatable.addOnCompleteListener(() => this._storage.remove(newUpdatable));
    }

    private processUpdatable (deltaTime: number): void {
        if (!this._storage.any()) return;

        let result = "";
        for (const updatable of this._storage) {
            updatable.update(deltaTime);
            if (updatable instanceof Mover)
            {
                result = result +  updatable.getValue().toFixed(3) + "; ";

            }

        }

       // if (result != "") console.log(result);
        if (result != "" && this._onCycleDone != null)
        {
            let cr = new BaseCycleReport(result);
            this._onCycleDone(cr);
        }

    }

    public start(): void {
        this._runner.start();
    }

    public stop(): void {
        this._runner.stop();
    }

    public getState(): RunnerState {
        return this._runner.getState();
    }


}