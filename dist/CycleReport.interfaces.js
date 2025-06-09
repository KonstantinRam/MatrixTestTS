import { z } from "zod";
export const CycleReportSchema = z.object({
    ToString: z.function()
        .args()
        .returns(z.string())
});
//# sourceMappingURL=CycleReport.interfaces.js.map