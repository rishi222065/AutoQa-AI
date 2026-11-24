import { z } from "zod";

export const superAdminRegistrationSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
    setupCode: z.string().min(1),
});

export type SuperAdminRegistrationInput = z.infer<
    typeof superAdminRegistrationSchema
>;