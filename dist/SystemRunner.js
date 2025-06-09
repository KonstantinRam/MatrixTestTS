import { UpdatableStorage } from "./UpdatableStorage.js";
import { z } from "zod";
import { RunnerSchema } from "./Runner.interfaces.js";
import { BaseRunner } from "./Runner.js";
import { Mover } from "./Mover.js";
import { BaseCycleReport } from "./CycleReport.js";
export const SystemRunnerConstructionSchema = z.object({
    deltaTimeMs: z.number(),
    abortSignal: z.instanceof(AbortSignal),
    runner: RunnerSchema.nullish(),
}).refine(data => data.deltaTimeMs > 0, { message: "Delta time must be greater than 0" });
const SINGLE_CYCLE_TIMELAPSE_MS = 17;
export class BaseSystemRunner {
    static create(params) {
        const workingParams = { ...params };
        if (workingParams.runner == null) {
            let defaultRunner = BaseRunner.create({ debugId: "SystemRunner runner", abortSignal: params.abortSignal });
            if (!defaultRunner.success) {
                console.error(`Failed to create default runner:`);
                return { success: false, errors: defaultRunner.errors };
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
        return { success: true, systemRunner: result };
    }
    constructor(deltaTimeMs, runner, abortSignal) {
        this._runner = runner;
        this._abortSignal = abortSignal;
        this._runner.assign(async () => {
            // let sw = new Stopwatch();
            //  sw.start();
            this.processUpdatable(deltaTimeMs);
            // await delay(this._toSleep, true, this._abortSignal);
            // sw.stop();
        }, async () => {
            // await delay(this._toSleep, true, this._abortSignal);
        });
    }
    _storage = new UpdatableStorage();
    _runner;
    _abortSignal;
    _toSleep = SINGLE_CYCLE_TIMELAPSE_MS;
    _onCycleDone = null;
    onCycleDone(onCycleDone) {
        this._onCycleDone = onCycleDone;
    }
    getTasksAmount() {
        return this._storage.count();
    }
    hasAnyTasks() {
        return this._storage.any();
    }
    push(newUpdatable) {
        if (typeof newUpdatable[Symbol.iterator] === 'function' && typeof newUpdatable.update !== 'function') {
            for (const updatable of newUpdatable) {
                this.pushSingle(updatable);
            }
        }
        else {
            this.pushSingle(newUpdatable);
        }
    }
    pushSingle(newUpdatable) {
        this._storage.add(newUpdatable);
        newUpdatable.addOnCompleteListener(() => this._storage.remove(newUpdatable));
    }
    processUpdatable(deltaTime) {
        if (!this._storage.any())
            return;
        let result = "";
        for (const updatable of this._storage) {
            updatable.update(deltaTime);
            if (updatable instanceof Mover) {
                result = result + updatable.getValue().toFixed(3) + "; ";
            }
        }
        //if (result != "") console.log(result);
        if (result != "" && this._onCycleDone != null) {
            let cr = new BaseCycleReport(result);
            this._onCycleDone(cr);
        }
    }
    start() {
        this._runner.start();
    }
    stop() {
        this._runner.stop();
    }
    getState() {
        return this._runner.getState();
    }
}
//# sourceMappingURL=SystemRunner.js.map