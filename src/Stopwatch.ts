import { Stopwatch as TSStopwatch } from 'ts-stopwatch';
// We can always write our own, but it's a very simple thing. I'll keep it in a shell.

export class Stopwatch {
    private readonly _sw: TSStopwatch;

    public constructor() {

        this._sw = new TSStopwatch(() => performance.now());
    }

    public start(): void {
        this._sw.start();
    }

    public stop(): void {
        this._sw.stop();
    }

    public getTime(): number {
        return this._sw.getTime();
    }


}