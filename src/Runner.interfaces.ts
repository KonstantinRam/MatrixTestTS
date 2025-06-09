import {RunnerState, RunnerStateSchema} from "./RunnerState.js";
import {AsyncVoidFunction, AsyncVoidFunctionSchema} from "./utils.js";
import {z} from "zod";


export interface Runner {
    start () : void;
    stop () : void;
    pause () : void;
    resume () : void;
    getState (): RunnerState;
    workAssigned (): boolean;
    assign(inLoop: AsyncVoidFunction, inIdle: AsyncVoidFunction): void;
}

export const RunnerSchema = z.object({
    start: z.function()
        .args()
        .returns(z.void()),

    stop: z.function()
        .args()
        .returns(z.void()),

    pause: z.function()
        .args()
        .returns(z.void()),

    resume: z.function()
        .args()
        .returns(z.void()),

    getState: z.function()
        .args()
        .returns(RunnerStateSchema),

    workAssigned: z.function()
        .args()
        .returns(z.boolean()),

    assign: z.function()
        .args(AsyncVoidFunctionSchema, AsyncVoidFunctionSchema)
        .returns(z.void()),
});

export type ValidatedRunnerInterface = z.infer<typeof RunnerSchema>;