import z from 'zod';
export const CompleteEventHandlerSchema = z.function()
    .args(z.any())
    .returns(z.void());
export class BaseUpdatable {
    update(deltaTime) {
        this.OnUpdate(deltaTime);
        if (this.Complete) {
            this.fireOneTimeOnComplete();
        }
    }
    _onCompleteHandlers = new Set();
    addOnCompleteListener(handler) {
        this._onCompleteHandlers.add(handler);
    }
    removeOnCompleteListener(handler) {
        this._onCompleteHandlers.delete(handler);
    }
    fireOneTimeOnComplete() {
        const handlersToInvoke = Array.from(this._onCompleteHandlers);
        this._onCompleteHandlers.clear();
        if (handlersToInvoke.length === 0) {
            console.log("fireOneTimeOnComplete' fired, but no listeners were attached at this time.");
            return;
        }
        for (const handler of handlersToInvoke) {
            try {
                handler(this);
            }
            catch (ex) {
                console.error(`Exception in 'fireOneTimeOnComplete' event handler (handler: ${handler.name || 'anonymous/bound'}): ${ex.message}`, ex);
            }
        }
    }
}
export class BaseValueUpdatable extends BaseUpdatable {
}
//# sourceMappingURL=Updatable.js.map