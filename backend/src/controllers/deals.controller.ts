import { Request, Response } from "express";
import { prisma } from "../config/db";
import { generateRecommendationsForUser } from "../services/recommendation.service";

const FEED_ITEMS_LIMIT = 50;

export async function getPersonalizedFeed(req: Request, res: Response): Promise<void> {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    res.status(400).json({ message: "userId query parameter is required" });
    return;
  }

  await generateRecommendationsForUser(userId);

  const recommendations = await prisma.recommendation.findMany({
    where: { userId },
    orderBy: { score: "desc" },
    take: FEED_ITEMS_LIMIT,
    include: {
      deal: {
        include: {
          product: true,
          merchant: {
            select: {
              storeName: true
            }
          }
        }
      }
    }
  });

  res.status(200).json({
    userId,
    items: recommendations
  });
}

export async function redeemDeal(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { userId, orderValue } = req.body as { userId?: string; orderValue?: number };

  if (!userId || typeof orderValue !== "number") {
    res.status(400).json({ message: "userId and numeric orderValue are required" });
    return;
  }

  const deal = await prisma.deal.findUnique({ where: { id } });

  if (!deal) {
    res.status(404).json({ message: "Deal not found" });
    return;
  }

  const discountValue = Number(((orderValue * deal.discountPercent) / 100).toFixed(2));

  const redemption = await prisma.redemption.create({
    data: {
      dealId: id,
      userId,
      orderValue,
      discountValue
    }
  });

  res.status(201).json(redemption);
}
