import axios from "axios";
import { AuthSession, FeedResponse, Metric, UserRole } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api"
});

export async function getPersonalizedFeed(userId: string): Promise<FeedResponse> {
  const { data } = await api.get<FeedResponse>(`/deals/feed?userId=${userId}`);
  return data;
}

export async function registerUser(payload: {
  email: string;
  fullName: string;
  password: string;
  role?: UserRole;
}): Promise<void> {
  await api.post("/auth/register", payload);
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>("/auth/login", payload);
  return data;
}

export async function redeemDeal(dealId: string, userId: string, orderValue: number): Promise<void> {
  await api.post(`/deals/${dealId}/redeem`, { userId, orderValue });
}

export async function createMerchantDeal(payload: {
  merchantId: string;
  productId: string;
  title: string;
  description?: string;
  discountPercent: number;
  code: string;
  startsAt: string;
  endsAt: string;
}): Promise<void> {
  await api.post("/merchant/deals", payload);
}

export async function getMerchantAnalytics(merchantId: string): Promise<Metric[]> {
  const { data } = await api.get<{ merchantId: string; metrics: Metric[] }>(`/merchant/${merchantId}/analytics`);
  return data.metrics;
}
