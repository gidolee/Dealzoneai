import { useEffect, useMemo, useState } from "react";
import DealCard from "../components/DealCard";
import { useAuth } from "../auth/AuthContext";
import { getPersonalizedFeed, redeemDeal } from "../services/api";
import { Deal, RecommendationItem } from "../types";
import { buildPartnerRedeemUrl } from "../utils/redeemLinks";

const inspirationSections = [
  { title: "City Flash Deals", subtitle: "Time-boxed local and online drops" },
  { title: "Student Value Picks", subtitle: "Verification-ready offers and essentials" },
  { title: "Fashion Trend Cuts", subtitle: "Brand-driven promos updated daily" }
];

export default function DealsPage(): JSX.Element {
  const { session } = useAuth();

  if (!session) {
    return <div className="panel">Session expired. Please sign in again.</div>;
  }

  const { user } = session;

  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [message, setMessage] = useState("Loading your personalized deals...");

  useEffect(() => {
    async function loadFeed(): Promise<void> {
      try {
        const data = await getPersonalizedFeed(user.id);
        setItems(data.items);
        setMessage(data.items.length ? "Personalized deals ready." : "No active personalized deals right now.");
      } catch {
        setMessage("Unable to load deals. Check API/database connectivity.");
      }
    }

    void loadFeed();
  }, [user.id]);

  const categories = useMemo(() => {
    const categorySet = new Set(items.map((item) => item.deal.product.category));
    return ["All", ...Array.from(categorySet)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.deal.product.category === activeCategory;
      const query = search.trim().toLowerCase();
      const searchMatch =
        query.length === 0 ||
        item.deal.title.toLowerCase().includes(query) ||
        item.deal.product.name.toLowerCase().includes(query) ||
        item.deal.merchant.storeName.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [items, activeCategory, search]);

  async function handleRedeem(deal: Deal): Promise<void> {
    const partnerUrl = buildPartnerRedeemUrl(deal);
    const partnerTab = window.open(partnerUrl, "_blank", "noopener,noreferrer");

    if (!partnerTab) {
      setMessage("Popup blocked. Allow popups to open the partner site.");
      return;
    }

    try {
      await redeemDeal(deal.id, user.id, 100);
      setMessage("Coupon redeemed. Partner site opened in a new tab.");
    } catch {
      setMessage("Partner site opened, but redemption logging failed.");
    }
  }

  return (
    <section>
      <div className="deals-hero">
        <div>
          <span className="eyebrow">WELCOME BACK, {user.fullName.toUpperCase()}</span>
          <h1>Daily deals tailored to your shopping behavior</h1>
          <p>
            Discover high-value offers in one stream. Browse like a deal marketplace, but ranked by your intent
            signals.
          </p>
        </div>
        <div className="hero-search-wrap">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search brands, categories, products"
          />
          <small>{message}</small>
        </div>
      </div>

      <div className="inspiration-grid">
        {inspirationSections.map((section) => (
          <article key={section.title} className="inspiration-card">
            <strong>{section.title}</strong>
            <p>{section.subtitle}</p>
          </article>
        ))}
      </div>

      <div className="category-strip">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? "category-chip active" : "category-chip"}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid">
        {filteredItems.map((item) => (
          <DealCard key={item.id} item={item} onRedeem={handleRedeem} />
        ))}
      </div>
    </section>
  );
}
