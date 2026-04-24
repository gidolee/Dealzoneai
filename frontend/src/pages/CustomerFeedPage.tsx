import { FormEvent, useState } from "react";
import DealCard from "../components/DealCard";
import { getPersonalizedFeed, redeemDeal } from "../services/api";
import { Deal, RecommendationItem } from "../types";
import { buildPartnerRedeemUrl } from "../utils/redeemLinks";

export default function CustomerFeedPage(): JSX.Element {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [message, setMessage] = useState("Enter a user ID to fetch personalized deals.");

  async function loadFeed(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setMessage("Loading recommendations...");

    try {
      const data = await getPersonalizedFeed(userId);
      setItems(data.items);
      setMessage(data.items.length > 0 ? "Deals ranked by AI score." : "No active deals for this user.");
    } catch {
      setMessage("Unable to load feed. Ensure API and database are running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem(deal: Deal): Promise<void> {
    const partnerUrl = buildPartnerRedeemUrl(deal);
    const partnerTab = window.open(partnerUrl, "_blank", "noopener,noreferrer");

    if (!partnerTab) {
      setMessage("Popup blocked. Allow popups to open the partner site.");
      return;
    }

    try {
      await redeemDeal(deal.id, userId, 100);
      setMessage("Deal redeemed and partner site opened.");
    } catch {
      setMessage("Partner site opened, but redemption logging failed.");
    }
  }

  return (
    <section>
      <div className="panel hero">
        <h1>Customer Deals Feed</h1>
        <p>Use behavior-driven deal ranking to serve high-intent offers.</p>
        <form onSubmit={loadFeed} className="inline-form">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Load Feed"}
          </button>
        </form>
        <small>{message}</small>
      </div>

      <div className="grid">
        {items.map((item) => (
          <DealCard key={item.id} item={item} onRedeem={handleRedeem} />
        ))}
      </div>
    </section>
  );
}
