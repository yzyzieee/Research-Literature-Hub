import Link from "next/link";
import type { CardMeta } from "@/lib/types";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/types";

export default function CardListItem({ card }: { card: CardMeta }) {
  return (
    <Link href={`/cards/${card.slug}`} className="card-item">
      <div className="titles">{card.title}</div>
      {card.summary && <div className="excerpt">{card.summary.slice(0, 180)}</div>}
      <div className="meta-row">
        <span className="badge type">{TYPE_LABELS[card.type]}</span>
        <span className={`badge ${card.status}`}>{STATUS_LABELS[card.status]}</span>
        {card.year && <span className="badge">{card.year}</span>}
        {card.tags.map((t) => (
          <span key={t} className="badge">#{t}</span>
        ))}
      </div>
    </Link>
  );
}
