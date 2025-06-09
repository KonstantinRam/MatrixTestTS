import {z} from "zod";

export interface CycleReport {
    ToString (): string;
}

export const CycleReportSchema = z.object({
    ToString: z.function()
        .args()
        .returns(z.string())
});

