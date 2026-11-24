import { Router } from "express";
import { superAdminRegister } from "./auth.controller";

const router = Router();

router.post("/super-admin/register", superAdminRegister);

export default router;