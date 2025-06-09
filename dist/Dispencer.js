import { SystemRunnerSchema } from "./SystemRunner.interfaces.js";
import { z } from "zod";
import { RunnerSchema } from "./Runner.interfaces.js";
import { BaseRunner } from "./Runner.js";
import { delay } from "./utils.js";
import { Tunnel } from "./Tunnel.js";
import { Mover } from "./Mover.js";
import { Ticker } from "./Ticker.js";
export const DispenserConstructionSchema = z.object({
    systemRunner: SystemRunnerSchema,
    delayTimeMs: z.number(),
    abortSignal: z.instanceof(AbortSignal),
    runner: RunnerSchema.nullish(),
}).refine(data => data.delayTimeMs > 0, { message: "Delay time must be greater than 0" });
export class BaseDispenser {
    static create(params) {
        const workingParams = { ...params };
        if (workingParams.runner == null) {
            let defaultRunner = BaseRunner.create({ debugId: "Dispenser runner", abortSignal: params.abortSignal });
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
        const validationResult = DispenserConstructionSchema.safeParse(workingParams);
        if (!validationResult.success) {
            console.error(`Dispenser parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            console.log(validationResult.error.issues);
            return { success: false, errors: validationResult.error.issues };
        }
        let result = new BaseDispenser(workingParams.systemRunner, workingParams.delayTimeMs, workingParams.abortSignal, workingParams.runner);
        return { success: true, dispenser: result };
    }
    constructor(systemRunner, delayTimeMs, abortSignal, runner) {
        this._runner = runner;
        this._systemRunner = systemRunner;
        this._delayTimeMs = delayTimeMs;
        this._internalController = new AbortController();
        const signalsToCombine = [this._internalController.signal];
        if (abortSignal) {
            signalsToCombine.push(abortSignal);
        }
        this._abortSignal = AbortSignal.any(signalsToCombine);
        this._runner.assign(async () => {
            if (this._tunnel.any()) {
                let request = await this._tunnel.read(this._abortSignal);
                if (request == null)
                    return;
                if (request === EDispatcherRequest.Mover) {
                    let moverCreation = Mover.create({ start: 10, end: 500, rate: 0.86 });
                    if (!moverCreation.success) {
                        throw new Error(`Failed to create mover: ${moverCreation.errors[0].message}`);
                    }
                    this._systemRunner.push(moverCreation.mover);
                }
                else if (request === EDispatcherRequest.Ticker) {
                    let tickerCreation = Ticker.create({ delayMS: 100, times: 15, fireOnFirstUpdate: true });
                    if (!tickerCreation.success) {
                        throw new Error(`Failed to create ticker: ${tickerCreation.errors[0].message}`);
                    }
                    let ticker = tickerCreation.ticker;
                    ticker.addOnTickEventListener(() => this.request(EDispatcherRequest.Mover));
                    this._systemRunner.push(ticker);
                }
                return;
            }
            await delay(this._delayTimeMs, true, this._abortSignal);
        }, async () => {
            await delay(this._delayTimeMs, true, this._abortSignal);
        });
        this._runner.start();
    }
    _systemRunner;
    _runner;
    _internalController;
    _abortSignal;
    _delayTimeMs = 0;
    _tunnel = new Tunnel();
    getState() {
        return this._runner.getState();
    }
    stop() {
        this._runner.stop();
    }
    resume() {
        this._runner.resume();
    }
    pause() {
        this._runner.pause();
    }
    request(request) {
        this._tunnel.write(request);
    }
    pendingRequestAmount() {
        return this._tunnel.count();
    }
    hasPendingRequest() {
        return this.pendingRequestAmount() > 0;
    }
}
export var EDispatcherRequest;
(function (EDispatcherRequest) {
    EDispatcherRequest[EDispatcherRequest["Mover"] = 0] = "Mover";
    EDispatcherRequest[EDispatcherRequest["Ticker"] = 1] = "Ticker";
})(EDispatcherRequest || (EDispatcherRequest = {}));
//# sourceMappingURL=Dispencer.js.map