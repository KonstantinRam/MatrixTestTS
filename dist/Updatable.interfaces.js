import { CompleteEventHandlerSchema } from "./Updatable.js";
import { z } from "zod";
export const UpdatableSchema = z.object({
    update: z.function()
        .args(z.number())
        .returns(z.void()),
    addOnCompleteListener: z.function()
        .args(CompleteEventHandlerSchema)
        .returns(z.void()),
    removeOnCompleteListener: z.function()
        .args(CompleteEventHandlerSchema)
        .returns(z.void())
});
export const createValueUpdatableSchema = (typeSchema) => {
    return UpdatableSchema.extend({
        getValue: z.function()
            .args()
            .returns(typeSchema)
    });
};
//# sourceMappingURL=Updatable.interfaces.js.map