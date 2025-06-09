import {CompleteEventHandler, CompleteEventHandlerSchema} from "./Updatable.js";
import {z} from "zod";

export interface Updatable
    {
        update(deltaTime: number): void;

        addOnCompleteListener(handler: CompleteEventHandler): void;
        removeOnCompleteListener(handler: CompleteEventHandler): void;
    }
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
})

    export interface ValueUpdatable<T> extends Updatable
    {
        getValue(): T;
    }

export const createValueUpdatableSchema = <T extends z.ZodTypeAny>(typeSchema: T) => {
    return UpdatableSchema.extend({
        getValue: z.function()
            .args()
            .returns(typeSchema)
    });
};
