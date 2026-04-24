import { Router } from "express";
import authRoutes from "./auth.routes";
import dealsRoutes from "./deals.routes";
import healthRoutes from "./health.routes";
import merchantRoutes from "./merchant.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/deals", dealsRoutes);
router.use("/merchant", merchantRoutes);

export default router;
