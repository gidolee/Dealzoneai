import { Router } from "express";
import { createDeal, getMerchantAnalytics } from "../controllers/merchant.controller";

const router = Router();

router.post("/deals", createDeal);
router.get("/:merchantId/analytics", getMerchantAnalytics);

export default router;
