import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createMerchantDeal, getMerchantAnalytics } from "../services/api";
import { Metric } from "../types";

const initialForm = {
  merchantId: "",
  productId: "",
  title: "",
  description: "",
  discountPercent: 10,
  code: "",
  startsAt: "",
  endsAt: ""
};

export default function MerchantPage(): JSX.Element {
  const { session } = useAuth();

  if (!session) {
    return <div className="panel">Session expired. Please sign in again.</div>;
  }

  const { user } = session;
  const [form, setForm] = useState(initialForm);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [message, setMessage] = useState("Create deals and view campaign metrics.");

  useEffect(() => {
    setForm((current) => ({ ...current, merchantId: user.id }));
  }, [user.id]);

  async function submitDeal(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      await createMerchantDeal(form);
      setMessage("Deal created.");
      setForm(initialForm);
    } catch {
      setMessage("Unable to create deal.");
    }
  }

  async function loadMetrics(): Promise<void> {
    if (!form.merchantId) {
      setMessage("Enter Merchant ID first.");
      return;
    }

    try {
      const data = await getMerchantAnalytics(form.merchantId);
      setMetrics(data);
      setMessage(`Loaded ${data.length} metric rows.`);
    } catch {
      setMessage("Unable to load analytics.");
    }
  }

  return (
    <section>
      <div className="panel hero">
        <h1>Merchant Console</h1>
        <p>Launch discount campaigns and monitor performance.</p>
        {user.role !== "MERCHANT" ? <small>Tip: current account role is {user.role}. Merchant role recommended.</small> : null}
      </div>

      <div className="two-col">
        <form className="panel" onSubmit={submitDeal}>
          <h2>Create Deal</h2>
          <input
            placeholder="Merchant ID"
            value={form.merchantId}
            onChange={(event) => setForm({ ...form, merchantId: event.target.value })}
            required
          />
          <input
            placeholder="Product ID"
            value={form.productId}
            onChange={(event) => setForm({ ...form, productId: event.target.value })}
            required
          />
          <input
            placeholder="Deal title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <input
            placeholder="Coupon code"
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value })}
            required
          />
          <input
            type="number"
            min={1}
            max={80}
            placeholder="Discount %"
            value={form.discountPercent}
            onChange={(event) => setForm({ ...form, discountPercent: Number(event.target.value) })}
            required
          />
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
            required
          />
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
            required
          />
          <button type="submit">Create Campaign</button>
        </form>

        <div className="panel">
          <h2>Analytics</h2>
          <button onClick={() => void loadMetrics()} className="secondary-button">
            Load Metrics
          </button>
          <small>{message}</small>
          <div className="metrics-list">
            {metrics.map((metric) => (
              <div key={metric.id} className="metric-row">
                <strong>{metric.deal.title}</strong>
                <p>
                  {new Date(metric.date).toLocaleDateString()} · Redemptions: {metric.redemptionsCount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
