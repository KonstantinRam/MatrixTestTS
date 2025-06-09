import {CycleReport} from "./CycleReport.interfaces.js";

export class BaseCycleReport implements CycleReport {

    private readonly _report: string = "";
    public constructor(st : string ) {
    this._report = st;
    }
    ToString(): string {
        return this._report;
    }
}