import {z} from "zod";

export enum RunnerState {
    Ready = 0,
    Running = 1,
    Retired = 2,
    Paused = 3
}
export const RunnerStateSchema = z.nativeEnum(RunnerState);