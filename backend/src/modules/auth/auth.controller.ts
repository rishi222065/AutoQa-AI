import type { Request, Response } from "express";
import { ZodError } from "zod";
import { superAdminRegistrationSchema } from "./auth.validation";
import { registerSuperAdmin } from "./auth.service";

export async function superAdminRegister(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const parsed = superAdminRegistrationSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Invalid registration details.",
                errors: parsed.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
            return;
        }

        const user = await registerSuperAdmin(parsed.data);

        res.status(201).json({
            success: true,
            message: "Super Admin account created successfully.",
            data: { user },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Registration failed.";

        if (message.includes("already been completed")) {
            res.status(403).json({ success: false, message });
            return;
        }

        if (
            message.includes("already exists") ||
            message.includes("Invalid Super Admin registration code")
        ) {
            res.status(409).json({ success: false, message });
            return;
        }

        if (message.includes("not configured")) {
            res.status(500).json({
                success: false,
                message: "Super Admin registration is not configured.",
            });
            return;
        }

        console.error("Super Admin registration error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to complete registration.",
        });
    }
}