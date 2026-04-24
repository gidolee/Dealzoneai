export type Deal = {
  id: string;
  title: string;
  code: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  product: {
    name: string;
    category: string;
    price: string;
    imageUrl?: string | null;
  };
  merchant: {
    storeName: string;
  };
};

export type UserRole = "CUSTOMER" | "MERCHANT" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type RecommendationItem = {
  id: string;
  score: number;
  reasoning: string | null;
  deal: Deal;
};

export type FeedResponse = {
  userId: string;
  items: RecommendationItem[];
};

export type Metric = {
  id: string;
  date: string;
  impressions: number;
  clicks: number;
  redemptionsCount: number;
  incrementalRevenue: string;
  marginImpact: string;
  deal: {
    title: string;
    code: string;
  };
};
