import { z } from "zod";
import { usernameValidation } from "./signUpSchema";

export const verifySchema = z.object({
    username: usernameValidation.transform((s) => s.trim()), // optional normalization
    code: z
        .string()
        .regex(/^\d{6}$/, "Verification code must be a 6‑digit number"),
});
