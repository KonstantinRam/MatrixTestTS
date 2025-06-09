import {Updatable, UpdatableSchema} from "./Updatable.interfaces.js";
import {z} from "zod";

export interface SystemRunner {
    push(newUpdatable: Updatable): void;
    push(newUpdatable: Iterable<Updatable>): void;
    hasAnyTasks(): boolean;
    getTasksAmount(): number;
}

const IterableSchema = (elementSchema: z.ZodTypeAny) => { //Sadly, it doesn't exist from the box.
    return z.any().refine(
        (value) => {

            if (typeof value?.[Symbol.iterator] !== 'function') {
                return false;
            }

            try {
                for (const element of value) {
                    elementSchema.parse(element);
                }
                return true;
            } catch {
                return false;
            }
        },
        {
            message: "Input must be an iterable and all its elements must match the provided schema.",
        }
    );
};

export const SystemRunnerSchema = z.object({
    push: z.function()
        .args(z.union([
            UpdatableSchema,
            IterableSchema(UpdatableSchema)
        ]))
        .returns(z.void()),

    hasAnyTasks: z.function()
        .args()
        .returns(z.boolean()),

    getTasksAmount: z.function()
        .args()
        .returns(z.number())
});


const IterableUpdatableSchema = IterableSchema(UpdatableSchema);