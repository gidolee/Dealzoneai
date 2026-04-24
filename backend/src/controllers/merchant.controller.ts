import { Request, Response } from "express";
import { prisma } from "../config/db";

export async function createDeal(req: Request, res: Response): Promise<void> {
  const { merchantId, productId, title, description, discountPercent, code, startsAt, endsAt } = req.body as {
    merchantId?: string;
    productId?: string;
    title?: string;
    description?: string;
    discountPercent?: number;
    code?: string;
    startsAt?: string;
    endsAt?: string;
  };

  if (!merchantId || !productId || !title || !code || !startsAt || !endsAt || typeof discountPercent !== "number") {
    res.status(400).json({ message: "Missing required deal fields" });
    return;
  }

  const deal = await prisma.deal.create({
    data: {
      merchantId,
      productId,
      title,
      description,
      discountPercent,
      code,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt)
    }
  });

  res.status(201).json(deal);
}

export async function getMerchantAnalytics(req: Request, res: Response): Promise<void> {
  const { merchantId } = req.params;

  const metrics = await prisma.campaignMetric.findMany({
    where: {
      deal: {
        merchantId
      }
    },
    include: {
      deal: {
        select: {
          title: true,
          code: true
        }
      }
    },
    orderBy: {
      date: "desc"
    }
  });

  res.status(200).json({ merchantId, metrics });
}
