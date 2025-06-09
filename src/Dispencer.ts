import {SystemRunner, SystemRunnerSchema} from "./SystemRunner.interfaces.js";
import {z} from "zod";
import {Runner, RunnerSchema} from "./Runner.interfaces.js";
import {BaseRunner} from "./Runner.js";
import {delay} from "./utils.js";
import {RunnerState} from "./RunnerState.js";
import {Tunnel} from "./Tunnel.js";
import {Mover} from "./Mover.js";
import {Ticker} from "./Ticker.js";

export const DispenserConstructionSchema = z.object({
    systemRunner: SystemRunnerSchema,
    delayTimeMs: z.number(),
    abortSignal: z.instanceof(AbortSignal),
    runner : RunnerSchema.nullish(),

}).refine(data => data.delayTimeMs > 0, {message: "Delay time must be greater than 0" })

type DispenserConstructionParams = z.infer<typeof DispenserConstructionSchema>;

export type CreateDispenserSuccess = {
    success: true;
    dispenser: BaseDispenser;
};

export type CreateDispenserFailure = {
    success: false;
    errors: z.ZodIssue[];
};

export class BaseDispenser {

    public static create (params: DispenserConstructionParams): CreateDispenserSuccess | CreateDispenserFailure {
        const workingParams = { ...params };

        if (workingParams.runner == null) {
            let defaultRunner = BaseRunner.create({debugId: "Dispenser runner", abortSignal: params.abortSignal});
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

        const validationResult = DispenserConstructionSchema.safeParse(workingParams);
        if (!validationResult.success) {
            console.error(`Dispenser parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            console.log(validationResult.error.issues);
            return { success: false, errors: validationResult.error.issues };
        }

        let result = new BaseDispenser(workingParams.systemRunner, workingParams.delayTimeMs, workingParams.abortSignal, workingParams.runner);
        return {success: true, dispenser: result}
    }
    private constructor(systemRunner: SystemRunner, delayTimeMs: number, abortSignal: AbortSignal, runner : Runner) {
        this._runner = runner;
        this._systemRunner = systemRunner;
        this._delayTimeMs = delayTimeMs;
        this._internalController = new AbortController();
        const signalsToCombine = [this._internalController.signal];
        if (abortSignal) {
            signalsToCombine.push(abortSignal);
        }

        this._abortSignal = AbortSignal.any(signalsToCombine);

        this._runner.assign(
            async () =>
            {
                if (this._tunnel.any())
                {
                    let request = await this._tunnel.read(this._abortSignal);
                    if (request == null) return;
                    if (request === EDispatcherRequest.Mover)
                    {
                        let moverCreation = Mover.create({start: 10, end: 500, rate: 0.86});
                        if (!moverCreation.success)
                        {
                            throw new Error(`Failed to create mover: ${moverCreation.errors[0].message}`);
                        }
                        this._systemRunner.push(moverCreation.mover);
                    }else if (request === EDispatcherRequest.Ticker)
                    {
                        let tickerCreation = Ticker.create({delayMS: 100, times: 15, fireOnFirstUpdate: true});
                        if (!tickerCreation.success)
                        {
                            throw new Error(`Failed to create ticker: ${tickerCreation.errors[0].message}`);
                        }
                        let ticker = tickerCreation.ticker;
                        ticker.addOnTickEventListener(() => this.request(EDispatcherRequest.Mover) );
                        this._systemRunner.push(ticker);
                    }
                    return;
                }
                await delay(this._delayTimeMs, true, this._abortSignal)
            },
            async ()=>
            {
                await delay(this._delayTimeMs, true, this._abortSignal)
            }
        );

        this._runner.start();
    }
    private readonly _systemRunner: SystemRunner;
    private readonly _runner: Runner;
    private readonly _internalController: AbortController;
    private readonly _abortSignal: AbortSignal;
    private _delayTimeMs: number = 0;
    private readonly _tunnel : Tunnel<EDispatcherRequest> = new Tunnel();


    public getState(): RunnerState {
        return this._runner.getState();
    }

    public stop(): void {
        this._runner.stop();
    }

    public resume(): void {
        this._runner.resume();
    }

   public pause(): void {
        this._runner.pause();
   }

   public request (request: EDispatcherRequest): void {
        this._tunnel.write(request);
   }

   public pendingRequestAmount () : number {
        return this._tunnel.count();
   }

   public hasPendingRequest() : boolean {
        return this.pendingRequestAmount() > 0;
   }
}

export enum EDispatcherRequest
{
    Mover = 0,
    Ticker = 1
}