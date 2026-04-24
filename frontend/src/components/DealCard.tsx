import { RecommendationItem } from "../types";
import { getDealCardImage } from "../utils/dealCardImage";

type DealCardProps = {
  item: RecommendationItem;
  onRedeem: (deal: RecommendationItem["deal"]) => Promise<void>;
};

export default function DealCard({ item, onRedeem }: DealCardProps): JSX.Element {
  const { deal, score } = item;
  const expiresLabel = new Date(deal.endsAt).toLocaleDateString();
  const matchPercent = Math.round(score * 100);
  const imageUrl = getDealCardImage(deal);

  return (
    <article className="deal-card">
      <div className="deal-media">
        <img src={imageUrl} alt={`${deal.product.name} deal`} loading="lazy" />
        <div className="deal-media-overlay">
          <span className="pill">{deal.product.category}</span>
          <span className="deal-discount-chip">{deal.discountPercent}% OFF</span>
        </div>
      </div>
      <div className="deal-content">
        <div className="deal-header">
          <p className="deal-store">{deal.merchant.storeName}</p>
          <strong className="deal-match">{matchPercent}% match</strong>
        </div>
        <h3>{deal.title}</h3>
        <p className="deal-product">{deal.product.name}</p>
        <div className="deal-meta">
          <span>Code {deal.code}</span>
          <span>Ends {expiresLabel}</span>
        </div>
        <div className="deal-score-track" aria-hidden="true">
          <span style={{ width: `${matchPercent}%` }} />
        </div>
        <button onClick={() => void onRedeem(deal)}>Get Deal</button>
      </div>
    </article>
  );
}
