import { Deal } from "../types";

type CategoryPartner = {
  baseUrl: string;
  queryParam: string;
};

const partnerByCategory: Record<string, CategoryPartner> = {
  FASHION: { baseUrl: "https://www.asos.com/search/", queryParam: "q" },
  BEAUTY: { baseUrl: "https://www.sephora.com/search", queryParam: "keyword" },
  ELECTRONICS: { baseUrl: "https://www.bestbuy.com/site/searchpage.jsp", queryParam: "st" },
  HOME: { baseUrl: "https://www.wayfair.com/keyword.php", queryParam: "keyword" },
  SPORTS: { baseUrl: "https://www.nike.com/w", queryParam: "q" },
  TRAVEL: { baseUrl: "https://www.booking.com/searchresults.html", queryParam: "ss" },
  FOOD: { baseUrl: "https://www.walmart.com/search", queryParam: "q" },
  WELLNESS: { baseUrl: "https://www.iherb.com/search", queryParam: "kw" },
  GAMING: { baseUrl: "https://www.gamestop.com/search/", queryParam: "q" },
  BOOKS: { baseUrl: "https://www.amazon.com/s", queryParam: "k" }
};

const fallbackPartner: CategoryPartner = {
  baseUrl: "https://www.amazon.com/s",
  queryParam: "k"
};

export function buildPartnerRedeemUrl(deal: Deal): string {
  const categoryKey = deal.product.category.toUpperCase();
  const partner = partnerByCategory[categoryKey] ?? fallbackPartner;
  const keyword = `${deal.product.name} ${deal.merchant.storeName}`;
  const url = new URL(partner.baseUrl);
  url.searchParams.set(partner.queryParam, keyword);
  return url.toString();
}
