import z from 'zod';
import {Updatable, ValueUpdatable} from './Updatable.interfaces.js';

export type CompleteEventHandler = (sender: any) => void;

export const CompleteEventHandlerSchema = z.function()
    .args(z.any())
    .returns(z.void());

export abstract class BaseUpdatable implements Updatable {
    public update(deltaTime: number): void {

        this.OnUpdate(deltaTime);
        if (this.Complete) {
            this.fireOneTimeOnComplete();
        }
    }
    public abstract get Complete() : boolean;

    protected abstract OnUpdate(deltaTime: number): void;

    private _onCompleteHandlers: Set<CompleteEventHandler> = new Set();
    public addOnCompleteListener(handler: CompleteEventHandler): void {
        this._onCompleteHandlers.add(handler);
    }
    public removeOnCompleteListener(handler: CompleteEventHandler): void {
        this._onCompleteHandlers.delete(handler);
    }

    protected fireOneTimeOnComplete(): void {

        const handlersToInvoke = Array.from(this._onCompleteHandlers);
        this._onCompleteHandlers.clear();

        if (handlersToInvoke.length === 0) {
            console.log("fireOneTimeOnComplete' fired, but no listeners were attached at this time.");
            return;
        }

        for (const handler of handlersToInvoke) {
            try {

                handler(this);
            } catch (ex: any) {

                console.error(`Exception in 'fireOneTimeOnComplete' event handler (handler: ${handler.name || 'anonymous/bound'}): ${ex.message}`, ex);
            }
        }
    }
}

export abstract class BaseValueUpdatable<T> extends BaseUpdatable implements ValueUpdatable<T> {


   public abstract getValue(): T;


}