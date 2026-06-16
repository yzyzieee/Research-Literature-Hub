"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CardMeta } from "@/lib/types";
import { domainLabel, publicationTypeLabel } from "@/lib/types";
import DownloadButton from "./DownloadButton";

export default function CardListItem({ card }: { card: CardMeta }) {
  const router = useRouter();
  const cite = [card.authors[0], card.year].filter(Boolean).join(" · ");
  // Tags double as navigation: clicking one opens the library filtered to it.
  const openTag = (event: React.MouseEvent, tag: string) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/cards?tag=${encodeURIComponent(tag)}`);
  };
  const [figureVisible, setFigureVisible] = useState(
    card.key_figure.status === "cached" && Boolean(card.key_figure.image_ref),
  );
  return (
    <Link href={`/cards/${card.slug}`} className={`card-item ${figureVisible ? "has-figure" : ""}`}>
      {figureVisible && (
        <img
          className="card-figure-thumb"
          src={`/api/drive/file?id=${encodeURIComponent(card.key_figure.image_ref || "")}`}
          alt=""
          loading="lazy"
          onError={() => setFigureVisible(false)}
        />
      )}
      <div className="card-item-content">
        <div className="titles">
          {card.title}
          {card.drive.length > 0 && (
            <span className="dl-slot">
              <DownloadButton link={card.drive[0]} variant="view" compact />
              <DownloadButton link={card.drive[0]} compact />
            </span>
          )}
        </div>
        {cite && <div className="cite">{cite}{card.authors.length > 1 ? " et al." : ""}</div>}
        {card.summary && <div className="excerpt">{card.summary.slice(0, 180)}</div>}
        <div className="meta-row">
          {card.primary_domain && (
            <span className="badge domain">{domainLabel(card.primary_domain)}</span>
          )}
          {card.publication_type && (
            <span className="badge type">{publicationTypeLabel(card.publication_type)}</span>
          )}
          {card.venue && <span className="badge">{card.venue}</span>}
          {card.rating && <span className="badge weight">Weight {card.rating.weight}</span>}
          {card.comments.length > 0 && <span className="badge">Comments {card.comments.length}</span>}
          {card.tags.map((t) => (
            <button key={t} type="button" className="badge badge-tag" onClick={(event) => openTag(event, t)}>
              #{t}
            </button>
          ))}
        </div>
      </div>
    </Link>
  );
}
