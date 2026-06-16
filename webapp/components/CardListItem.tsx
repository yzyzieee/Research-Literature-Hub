"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CardMeta } from "@/lib/types";
import { domainLabel, publicationTypeLabel } from "@/lib/types";
import { cardToBibtex } from "@/lib/export";
import DownloadButton from "./DownloadButton";
import CopyButton from "./CopyButton";

export default function CardListItem({ card }: { card: CardMeta }) {
  const router = useRouter();
  const cite = [card.authors[0], card.year].filter(Boolean).join(" · ");
  // Badges double as navigation: clicking one opens the library filtered to it.
  const openFilter = (event: React.MouseEvent, key: "tag" | "domain" | "type", value: string) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/cards?${key}=${encodeURIComponent(value)}`);
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
          <span className="dl-slot">
            {card.drive.length > 0 && (
              <>
                <DownloadButton link={card.drive[0]} variant="view" compact />
                <DownloadButton link={card.drive[0]} compact />
              </>
            )}
            <CopyButton text={cardToBibtex(card)} labelKey="detail.copyBibtex" compact />
          </span>
        </div>
        {cite && <div className="cite">{cite}{card.authors.length > 1 ? " et al." : ""}</div>}
        {card.summary && <div className="excerpt">{card.summary.slice(0, 180)}</div>}
        <div className="meta-row">
          {card.primary_domain && (
            <button
              type="button"
              className="badge domain badge-tag"
              onClick={(event) => openFilter(event, "domain", card.primary_domain)}
            >
              {domainLabel(card.primary_domain)}
            </button>
          )}
          {card.publication_type && (
            <button
              type="button"
              className="badge type badge-tag"
              onClick={(event) => openFilter(event, "type", card.publication_type)}
            >
              {publicationTypeLabel(card.publication_type)}
            </button>
          )}
          {card.venue && <span className="badge">{card.venue}</span>}
          {card.rating && <span className="badge weight">Weight {card.rating.weight}</span>}
          {card.comments.length > 0 && <span className="badge">Comments {card.comments.length}</span>}
          {card.tags.map((t) => (
            <button key={t} type="button" className="badge badge-tag" onClick={(event) => openFilter(event, "tag", t)}>
              #{t}
            </button>
          ))}
        </div>
      </div>
    </Link>
  );
}
