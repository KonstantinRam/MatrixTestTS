export class SystemRunnerMock {
    _counter = 0;
    getTasksAmount() {
        return this._counter;
    }
    hasAnyTasks() {
        return this._counter > 0;
    }
    push(newUpdatable) {
        if (typeof newUpdatable[Symbol.iterator] === 'function' && typeof newUpdatable.update !== 'function') {
            for (const updatable of newUpdatable) {
                this._counter++;
            }
        }
        else {
            this._counter++;
        }
    }
}
//# sourceMappingURL=SystemRunnerMock.js.map