import {z} from 'zod';
import {BaseUpdatable} from ".//Updatable.js";

export const TickerConstructionSchema = z.object({
    delayMS: z.number().min(1, "Delay parameter must be greater than 0"),
    times: z.number().min(1, "Times parameter must be greater than 0"),
    fireOnFirstUpdate: z.boolean().optional()
})
type TickerConstructionParams = z.infer<typeof TickerConstructionSchema>;

export type CreateTickerSuccess = {
    success: true;
    ticker: Ticker;
};

export type CreateTickerFailure = {
    success: false;
    errors: z.ZodIssue[];
};

export type CreateTickerResult = CreateTickerSuccess | CreateTickerFailure;

export const TickerSchema = z.object({  //It's a bit of overkill for a tiny object, but it's good practice. (also, this comment was autocompleted by ide, which is eery as F.)
    delayMS: z.number().min(1, "Delay must be greater than 0"),
    times: z.number().min(1, "Times must be greater than 0"),
    timesTickFired: z.number().min(0, "Times remaining must be greater or equal 0")
}).refine((data) => data.timesTickFired <= data.times, {message: "Times Remaining should be equal or less then Times"})

export type TickerState = z.infer<typeof TickerSchema>;

export type OnTickEventHandler = (sender: any) => void;  // No params needed.

export class Ticker extends BaseUpdatable {
    public static create(params: TickerConstructionParams): CreateTickerResult {
        const validationResult = TickerConstructionSchema.safeParse(params);

        if (!validationResult.success) {
            console.error(`Ticker parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            return { success: false, errors: validationResult.error.issues };
        }

        let result = new Ticker(validationResult.data.delayMS, validationResult.data.times);
        let postConstructionValidation = result.validateState();
        return postConstructionValidation.success ? {success: true, ticker: result} : {success: false, errors: postConstructionValidation.errors ?? []};
    }
    private constructor(delayMS: number, times : number, fireOnFirstUpdate?: boolean) {
        super();

        this._times = times;
        this._delayMS = delayMS;
        this._timesTickFired = 0;

        if (fireOnFirstUpdate) {this._firstUpdateMod = 0}
    }

    public get Complete(): boolean {
        return this._timesTickFired >= this._times;
    }
    protected OnUpdate(deltaTime: number): void {
        this.addDeltaTime(deltaTime);

        while (this.isReadyToFire())
        {
            this.fireOnTickEvent();
            this._timesTickFired++;
        }
    }

    private _timesTickFired: number = 0;
    private readonly _times : number;
    private readonly _delayMS : number;
    private _timeElapsed: number = 0;
    private readonly _firstUpdateMod : number = 1;

    private _onTickEventHandlers: Set<OnTickEventHandler> = new Set();

    public addOnTickEventListener(handler: OnTickEventHandler): void {
        this._onTickEventHandlers.add(handler);
    }
    public removeOnTickEventListener(handler: OnTickEventHandler): void {
        this._onTickEventHandlers.delete(handler);
    }

    protected fireOnTickEvent(): void {

        const handlersToInvoke = Array.from(this._onTickEventHandlers);

        if (handlersToInvoke.length === 0) {
            console.log("fireOnTickEvent' fired, but no listeners were attached at this time.");
            return;
        }

        for (const handler of handlersToInvoke) {
            try {

                handler(this);
            } catch (ex: any) {

                console.error(`Exception in 'fireOnTickEvent' event handler (handler: ${handler.name || 'anonymous/bound'}): ${ex.message}`, ex);
            }
        }
    }

    private getCurrentState(): TickerState {
        return {
           delayMS: this._delayMS,
           times: this._times,
            timesTickFired: this._timesTickFired
        };
    }

    private addDeltaTime(deltaTime: number): void {
        this._timeElapsed += deltaTime;
    }

    private isReadyToFire(): boolean {
        return this._timeElapsed >= (this._delayMS * (this._timesTickFired + this._firstUpdateMod));
    }

    public validateState(): { success: boolean; errors?: z.ZodIssue[] } {
        const result = TickerSchema.safeParse(this.getCurrentState());

        if (!result.success) {
            console.error(`${this} validation failed:`, result.error.flatten().fieldErrors);
            return { success: false, errors: result.error.issues };
        }
        return { success: true };
    }
}

