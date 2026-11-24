import bcrypt from "bcrypt";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../config/database";
import type { SuperAdminRegistrationInput } from "./auth.validation";

export async function registerSuperAdmin(input: SuperAdminRegistrationInput) {
    const configuredCode = process.env.SUPER_ADMIN_SETUP_CODE;

    if (!configuredCode) {
        throw new Error("SUPER_ADMIN_SETUP_CODE is not configured.");
    }

    if (input.setupCode !== configuredCode) {
        throw new Error("Invalid Super Admin registration code.");
    }

    const email = input.email.toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
        return await prisma.$transaction(async (tx) => {
            // Serialize initial Super Admin registration attempts.
            await tx.$queryRaw`
                SELECT pg_advisory_xact_lock(7281946201::bigint)
            `;

            const existingSuperAdmin = await tx.user.count({
                where: { role: UserRole.SUPER_ADMIN },
            });

            if (existingSuperAdmin > 0) {
                throw new Error(
                    "Super Admin registration has already been completed."
                );
            }

            const existingUser = await tx.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new Error("An account with this email already exists.");
            }

            const user = await tx.user.create({
                data: {
                    name: input.name,
                    email,
                    passwordHash,
                    role: UserRole.SUPER_ADMIN,
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            });

            return user;
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error("An account with this email already exists.");
        }

        throw error;
    }
}