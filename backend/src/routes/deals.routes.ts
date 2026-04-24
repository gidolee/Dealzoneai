import { Router } from "express";
import { getPersonalizedFeed, redeemDeal } from "../controllers/deals.controller";

const router = Router();

router.get("/feed", getPersonalizedFeed);
router.post("/:id/redeem", redeemDeal);

export default router;
