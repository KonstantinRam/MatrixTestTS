import { Stopwatch as TSStopwatch } from 'ts-stopwatch';
// We can always write our own, but it's a very simple thing. I'll keep it in a shell.
export class Stopwatch {
    _sw;
    constructor() {
        this._sw = new TSStopwatch(() => performance.now());
    }
    start() {
        this._sw.start();
    }
    stop() {
        this._sw.stop();
    }
    getTime() {
        return this._sw.getTime();
    }
}
//# sourceMappingURL=Stopwatch.js.map