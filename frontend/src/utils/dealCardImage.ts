import { Deal } from "../types";

const categoryImages: Record<string, string> = {
  FASHION: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  BEAUTY: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  ELECTRONICS: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  HOME: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
  SPORTS: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
  TRAVEL: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  FOOD: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
  WELLNESS: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",
  GAMING: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
  BOOKS: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
};

const productKeywordImages: Array<{ pattern: RegExp; url: string }> = [
  { pattern: /(sneaker|shoe|loafer|running)/i, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(jacket|hoodie|chino|denim)/i, url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(crossbody|bag|luggage|backpack|sling)/i, url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(skincare|serum|cream|spf|fragrance|mask)/i, url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(earbud|headphone|speaker)/i, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(watch|tracker|band)/i, url: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(keyboard|mouse|webcam|gaming|controller)/i, url: "https://images.unsplash.com/photo-1542751371-29b4f74f9713?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(streaming|hub|adapter|usb)/i, url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(air fryer|vacuum|lamp|organizer|sheet|pillow)/i, url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(dumbbell|yoga|helmet|hydration|fitness)/i, url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(travel|cube|neck pillow)/i, url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(coffee|tea|chocolate|snack|spice|pantry)/i, url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(massage|sleep|posture|glasses|meditation|diffuser)/i, url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80" },
  { pattern: /(book|science|startup|marketing|finance|research|playbook)/i, url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80" }
];

const fallbackImage =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80";

export function getDealCardImage(deal: Deal): string {
  if (deal.product.imageUrl && deal.product.imageUrl.trim().length > 0) {
    return deal.product.imageUrl;
  }

  const keywordMatch = productKeywordImages.find(({ pattern }) => pattern.test(deal.product.name));
  if (keywordMatch) {
    return keywordMatch.url;
  }

  return categoryImages[deal.product.category.toUpperCase()] ?? fallbackImage;
}
