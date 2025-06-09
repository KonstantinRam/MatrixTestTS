import { RunnerStateSchema } from "./RunnerState.js";
import { AsyncVoidFunctionSchema } from "./utils.js";
import { z } from "zod";
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
//# sourceMappingURL=Runner.interfaces.js.map