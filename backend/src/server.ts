
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { prisma } from "./config/database";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./modules/auth/auth.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);

const server = app.listen(PORT, () => {
    console.log(`AutoQA AI API running at http://localhost:${PORT}`);
});

async function shutdown() {
    console.log("Shutting down AutoQA AI API...");

    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
