import {Semaphore} from 'async-mutex';

export class Tunnel<T> {
    private readonly _queue: T[] = [];
    private readonly _semaphore: Semaphore;

    constructor() {
        this._semaphore = new Semaphore(0);
    }

    public count(): number {
        return this._queue.length;
    }

    public any(): boolean {
        return this._queue.length > 0;
    }

    public hasInQueue(value: T): boolean {
        return value != null && this._queue.includes(value);
    }

    public write(value: T): void {
        if (value === null || value === undefined) {
            return;
        }

        this._queue.push(value);
        this._semaphore.release();
    }

    public async read(abortSignal?: AbortSignal): Promise<T | undefined> {
        if (abortSignal?.aborted) {
            throw new Error("Operation was aborted.");
        }

        try {
            await this._semaphore.acquire();
        } catch (e) {
            if (e instanceof Error && e.message.includes('aborted')) {
                throw new Error("Read operation was aborted.");
            }
            throw e;
        }

        return this._queue.shift();
    }

}