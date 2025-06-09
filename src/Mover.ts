import {z} from 'zod'
import {BaseValueUpdatable} from "./Updatable.js";

export const MoverConstructionSchema = z.object({
    start: z.number().min(0, "start parameter must be greater than 0"),
    end: z.number().min(0, "end parameter must be greater than 0"),
    rate: z.number()
}).refine(data => data.rate !== 0, {message: "rate parameter should not be equal 0" } )
    .refine(data => data.start !== data.end, {message: "start and end parameters should not be equal" })

type MoverConstructionParams = z.infer<typeof MoverConstructionSchema>;

export type CreateMoverSuccess = {
    success: true;
    mover: Mover;
};

export type CreateMoverFailure = {
    success: false;
    errors: z.ZodIssue[];
};

export const MoverSchema = z.object({
    start: z.number().min(0, "start parameter must be greater than 0"),
    end: z.number().min(0, "end parameter must be greater than 0"),
    rate: z.number(),
    isAscending: z.boolean()
}).refine(data => data.rate !== 0, {message: "rate parameter should not be equal 0" } )
    .refine(data => data.start !== data.end, {message: "start and end parameters should not be equal" })
    .superRefine( (data, ctx) =>
{
    if (data.isAscending && (data.start > data.end)) {
        ctx.addIssue(
            {
                code: z.ZodIssueCode.custom,
                message: "Start value must be less than end value when moving in ascending direction.",
                path: ["isAscending"]
            }
        )
    }

    if (!data.isAscending && (data.start < data.end)) {
        ctx.addIssue(
            {
                code: z.ZodIssueCode.custom,
                message: "Start value must be greater than end value when moving in descending direction.",
                path: ["isAscending"]
            }
        )
    }
})
export type MoverState = z.infer<typeof MoverSchema>;

export type CreateMoverResult = CreateMoverSuccess | CreateMoverFailure;

export class Mover extends BaseValueUpdatable<number>{

    public static create(params: MoverConstructionParams): CreateMoverResult {
        const validationResult = MoverConstructionSchema.safeParse(params);

        if (!validationResult.success) {
            console.error(`Mover parameters creation failed validation:`, validationResult.error.flatten().fieldErrors);
            return { success: false, errors: validationResult.error.issues };
        }

        let result = new Mover(validationResult.data.start, validationResult.data.end, validationResult.data.rate);
        let postConstructionValidation = result.validateState();
        return postConstructionValidation.success ? {success: true, mover: result} : {success: false, errors: postConstructionValidation.errors ?? []};
    }

    private constructor(start: number, end: number, rate: number) {
        super();
        this._start = start;
        this._end = end;
        this._rate = rate;
        this._isAscending = rate > 0;
        this._value = this._start;
    }

    private readonly _start: number;
    private readonly _end: number;
    private readonly _rate: number;
    private readonly _isAscending: boolean;
    private _value: number = 0;


    public getValue(): number {
        return this._value;
    }
    public get Complete(): boolean {
        return this._isAscending ? this._value >= this._end : this._value <= this._end;
    }
    protected OnUpdate(deltaTime: number): void {
        this._value += deltaTime * this._rate;
        this._value = this._isAscending ? Math.max(this._start, Math.min(this._value, this._end)) : Math.min(this._start, Math.max(this._value, this._end));
    }


    private getCurrentState(): MoverState {
        return {
            start: this._start,
            end: this._end,
            rate: this._rate,
            isAscending: this._isAscending

        };
    }

    public validateState(): { success: boolean; errors?: z.ZodIssue[] } {
        const result = MoverSchema.safeParse(this.getCurrentState());

        if (!result.success) {
            console.error(`${this} validation failed:`, result.error.flatten().fieldErrors);

            return { success: false, errors: result.error.issues };
        }
        return { success: true };
    }

}