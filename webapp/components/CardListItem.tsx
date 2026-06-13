import Link from "next/link";
import type { CardMeta } from "@/lib/types";
import { STATUS_LABELS, TYPE_LABELS, domainLabel } from "@/lib/types";

export default function CardListItem({ card }: { card: CardMeta }) {
  const cite = [card.authors[0], card.year].filter(Boolean).join(" · ");
  return (
    <Link href={`/cards/${card.slug}`} className="card-item">
      <div className="titles">{card.title}</div>
      {cite && <div className="cite">{cite}{card.authors.length > 1 ? " et al." : ""}</div>}
      {card.summary && <div className="excerpt">{card.summary.slice(0, 180)}</div>}
      <div className="meta-row">
        {card.domain && <span className="badge domain">{domainLabel(card.domain)}</span>}
        <span className="badge type">{TYPE_LABELS[card.type]}</span>
        <span className={`badge ${card.status}`}>{STATUS_LABELS[card.status]}</span>
        {card.tags.map((t) => (
          <span key={t} className="badge">#{t}</span>
        ))}
      </div>
    </Link>
  );
}
