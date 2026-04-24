import fs from "fs";
import path from "path";
import { Deal, Recommendation, UserEvent } from "@prisma/client";
import { prisma } from "../config/db";

type DealWithProduct = Deal & {
  product: {
    category: string;
  };
};

type BehaviorModel = {
  feature_order: string[];
  normalization: {
    mean: number[];
    std: number[];
  };
  model: {
    weights: number[];
    bias: number;
  };
};

type BehaviorSummary = {
  views: number;
  addToCart: number;
  searches: number;
  clicks: number;
  recencyDays: number;
};

let cachedBehaviorModel: BehaviorModel | null | undefined;
const MAX_FEED_ITEMS = 50;
const DEAL_POOL_SIZE = 200;

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function loadBehaviorModel(): BehaviorModel | null {
  if (cachedBehaviorModel !== undefined) {
    return cachedBehaviorModel;
  }

  const candidatePaths = [
    path.resolve(process.cwd(), "ml/artifacts/user_behavior_model.json"),
    path.resolve(process.cwd(), "../ml/artifacts/user_behavior_model.json")
  ];

  for (const candidatePath of candidatePaths) {
    try {
      if (!fs.existsSync(candidatePath)) {
        continue;
      }

      const parsed = JSON.parse(fs.readFileSync(candidatePath, "utf-8")) as Partial<BehaviorModel>;
      const isValid =
        Array.isArray(parsed.feature_order) &&
        Array.isArray(parsed.normalization?.mean) &&
        Array.isArray(parsed.normalization?.std) &&
        Array.isArray(parsed.model?.weights) &&
        typeof parsed.model?.bias === "number" &&
        parsed.feature_order.length === parsed.normalization.mean.length &&
        parsed.feature_order.length === parsed.normalization.std.length &&
        parsed.feature_order.length === parsed.model.weights.length;

      if (isValid) {
        cachedBehaviorModel = parsed as BehaviorModel;
        return cachedBehaviorModel;
      }
    } catch {
      // Continue trying next candidate path.
    }
  }

  cachedBehaviorModel = null;
  return cachedBehaviorModel;
}

function summarizeBehavior(events: UserEvent[]): BehaviorSummary {
  const latestEvent = events[0];
  const recencyDays = latestEvent
    ? Math.max(0, (Date.now() - latestEvent.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  return {
    views: events.filter((event) => event.type === "PRODUCT_VIEW").length,
    addToCart: events.filter((event) => event.type === "ADD_TO_CART").length,
    searches: events.filter((event) => event.type === "SEARCH").length,
    clicks: events.filter((event) => event.type === "CLICK").length,
    recencyDays
  };
}

function scoreDealRuleBased(deal: DealWithProduct, behavior: BehaviorSummary): number {
  const viewBoost = Math.min(behavior.views / 20, 1);
  const cartBoost = Math.min(behavior.addToCart / 8, 1);
  const searchBoost = Math.min(behavior.searches / 10, 1);
  const recencyBoost = Math.max(0, 1 - behavior.recencyDays / 30);
  const discountBoost = Math.min(deal.discountPercent / 100, 0.6);

  return Number((0.3 * viewBoost + 0.25 * cartBoost + 0.15 * searchBoost + 0.15 * recencyBoost + 0.15 * discountBoost).toFixed(3));
}

function scoreDealWithBehaviorModel(deal: DealWithProduct, behavior: BehaviorSummary, model: BehaviorModel): number {
  const featureMap: Record<string, number> = {
    views: behavior.views,
    add_to_cart: behavior.addToCart,
    searches: behavior.searches,
    clicks: behavior.clicks,
    discount_percent: deal.discountPercent,
    recency_days: behavior.recencyDays
  };

  const standardizedFeatures = model.feature_order.map((featureName, index) => {
    const rawValue = featureMap[featureName] ?? 0;
    const mean = model.normalization.mean[index] ?? 0;
    const std = model.normalization.std[index] || 1;
    return (rawValue - mean) / std;
  });

  const linearScore =
    standardizedFeatures.reduce((total, value, index) => total + value * (model.model.weights[index] ?? 0), 0) + model.model.bias;

  return Number(sigmoid(linearScore).toFixed(3));
}

export async function generateRecommendationsForUser(userId: string): Promise<Recommendation[]> {
  const [events, activeDeals] = await Promise.all([
    prisma.userEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
    prisma.deal.findMany({
      where: {
        status: "ACTIVE",
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() }
      },
      include: {
        product: {
          select: {
            category: true
          }
        }
      },
      take: DEAL_POOL_SIZE
    })
  ]);

  const behavior = summarizeBehavior(events);
  const behaviorModel = loadBehaviorModel();

  const scoredDeals = activeDeals
    .map((deal) => {
      const ruleScore = scoreDealRuleBased(deal, behavior);

      if (!behaviorModel) {
        return {
          deal,
          score: ruleScore,
          reasoning: "Ranked by rule-based behavior and discount signals"
        };
      }

      const modelScore = scoreDealWithBehaviorModel(deal, behavior, behaviorModel);
      const combinedScore = Number((0.8 * modelScore + 0.2 * ruleScore).toFixed(3));

      return {
        deal,
        score: combinedScore,
        reasoning: "Ranked by Python-trained behavior model blended with rule-based baseline"
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_FEED_ITEMS);

  const savedRecommendations = await Promise.all(
    scoredDeals.map(({ deal, score, reasoning }) =>
      prisma.recommendation.upsert({
        where: {
          userId_dealId: {
            userId,
            dealId: deal.id
          }
        },
        update: {
          score,
          reasoning
        },
        create: {
          userId,
          dealId: deal.id,
          score,
          reasoning
        }
      })
    )
  );

  return savedRecommendations;
}
