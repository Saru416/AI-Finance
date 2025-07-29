import z from "zod";
import is from "zod/v4/locales/is.cjs";

export const accountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Initial Balance is required"),
    isDefault: z.boolean().default(false),
})