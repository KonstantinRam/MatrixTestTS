export class UpdatableStorage {
    // The initial version using a single threaded nature of TS. No need for locking, but I have another runner in the plans.
    _collection = []; // as with C# version I am using the most basic collection.
    add(entityToAdd) {
        if (this._collection.includes(entityToAdd)) {
            throw new Error("Item already exists in collection.");
        }
        this._collection.push(entityToAdd);
    }
    remove(entityToRemove) {
        const index = this._collection.indexOf(entityToRemove);
        if (index === -1) {
            throw new Error("Collection doesn't have the item to remove.");
        }
        this._collection.splice(index, 1);
    }
    count() {
        return this._collection.length;
    }
    any() {
        return this._collection.length > 0;
    }
    [Symbol.iterator]() {
        return this.getSnapshot()[Symbol.iterator]();
    }
    getSnapshot() {
        return [...this._collection];
    }
}
//# sourceMappingURL=UpdatableStorage.js.map