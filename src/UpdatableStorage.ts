import {Updatable} from "./Updatable.interfaces.js";

export class UpdatableStorage implements Iterable<Updatable> {
    // The initial version using a single threaded nature of TS. No need for locking, but I have another runner in the plans.
    private readonly _collection: Updatable[] = []; // as with C# version I am using the most basic collection.

    public add(entityToAdd: Updatable): void {
        if (this._collection.includes(entityToAdd)) {
            throw new Error("Item already exists in collection.");
        }
        this._collection.push(entityToAdd);
    }

    public remove(entityToRemove: Updatable): void {
        const index = this._collection.indexOf(entityToRemove);
        if (index === -1) {
            throw new Error("Collection doesn't have the item to remove.");
        }
        this._collection.splice(index, 1);
    }

    public count(): number {
        return this._collection.length;
    }

    public any(): boolean {
        return this._collection.length > 0;
    }

    public [Symbol.iterator](): Iterator<Updatable> {
        return this.getSnapshot()[Symbol.iterator]();
    }

    public getSnapshot(): Updatable[] {
        return [...this._collection];
    }
}