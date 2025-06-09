import { Semaphore } from 'async-mutex';
export class Tunnel {
    _queue = [];
    _semaphore;
    constructor() {
        this._semaphore = new Semaphore(0);
    }
    count() {
        return this._queue.length;
    }
    any() {
        return this._queue.length > 0;
    }
    hasInQueue(value) {
        return value != null && this._queue.includes(value);
    }
    write(value) {
        if (value === null || value === undefined) {
            return;
        }
        this._queue.push(value);
        this._semaphore.release();
    }
    async read(abortSignal) {
        if (abortSignal?.aborted) {
            throw new Error("Operation was aborted.");
        }
        try {
            await this._semaphore.acquire();
        }
        catch (e) {
            if (e instanceof Error && e.message.includes('aborted')) {
                throw new Error("Read operation was aborted.");
            }
            throw e;
        }
        return this._queue.shift();
    }
}
//# sourceMappingURL=Tunnel.js.map