import { z } from 'zod';
import { BaseUpdatable } from ".//Updatable.js";
export const TickerConstructionSchema = z.object({
    delayMS: z.number().min(1, "Delay parameter must be greater than 0"),
    times: z.number().min(1, "Times parameter must be greater than 0"),
    fireOnFirstUpdate: z.boolean().optional()
});
export const TickerSchema = z.object({
    delayMS: z.number().min(1, "Delay must be greater than 0"),
    times: z.number().min(1, "Times must be greater than 0"),
    timesTickFired: z.number().min(0, "Times remaining must be greater or equal 0")
}).refine((data) => data.timesTickFired <= data.times, { message: "Times Remaining should be equal or less then Times" });
export class Ticker extends BaseUpdatable {
    static create(params) {
        const validationResult = TickerConstructionSchema.safeParse(params);
        if (!validationResult.success) {
            console.error(`Ticker parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            return { success: false, errors: validationResult.error.issues };
        }
        let result = new Ticker(validationResult.data.delayMS, validationResult.data.times);
        let postConstructionValidation = result.validateState();
        return postConstructionValidation.success ? { success: true, ticker: result } : { success: false, errors: postConstructionValidation.errors ?? [] };
    }
    constructor(delayMS, times, fireOnFirstUpdate) {
        super();
        this._times = times;
        this._delayMS = delayMS;
        this._timesTickFired = 0;
        if (fireOnFirstUpdate) {
            this._firstUpdateMod = 0;
        }
    }
    get Complete() {
        return this._timesTickFired >= this._times;
    }
    OnUpdate(deltaTime) {
        this.addDeltaTime(deltaTime);
        while (this.isReadyToFire()) {
            this.fireOnTickEvent();
            this._timesTickFired++;
        }
    }
    _timesTickFired = 0;
    _times;
    _delayMS;
    _timeElapsed = 0;
    _firstUpdateMod = 1;
    _onTickEventHandlers = new Set();
    addOnTickEventListener(handler) {
        this._onTickEventHandlers.add(handler);
    }
    removeOnTickEventListener(handler) {
        this._onTickEventHandlers.delete(handler);
    }
    fireOnTickEvent() {
        const handlersToInvoke = Array.from(this._onTickEventHandlers);
        if (handlersToInvoke.length === 0) {
            console.log("fireOnTickEvent' fired, but no listeners were attached at this time.");
            return;
        }
        for (const handler of handlersToInvoke) {
            try {
                handler(this);
            }
            catch (ex) {
                console.error(`Exception in 'fireOnTickEvent' event handler (handler: ${handler.name || 'anonymous/bound'}): ${ex.message}`, ex);
            }
        }
    }
    getCurrentState() {
        return {
            delayMS: this._delayMS,
            times: this._times,
            timesTickFired: this._timesTickFired
        };
    }
    addDeltaTime(deltaTime) {
        this._timeElapsed += deltaTime;
    }
    isReadyToFire() {
        return this._timeElapsed >= (this._delayMS * (this._timesTickFired + this._firstUpdateMod));
    }
    validateState() {
        const result = TickerSchema.safeParse(this.getCurrentState());
        if (!result.success) {
            console.error(`${this} validation failed:`, result.error.flatten().fieldErrors);
            return { success: false, errors: result.error.issues };
        }
        return { success: true };
    }
}
//# sourceMappingURL=Ticker.js.map