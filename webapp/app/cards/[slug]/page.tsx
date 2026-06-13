import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard, getCards, toMeta } from "@/lib/kb";
import { renderCardBody } from "@/lib/markdown";
import { cardToPrompt } from "@/lib/export";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/types";
import { T } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";
import DownloadButton from "@/components/DownloadButton";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getCards().map((c) => ({ slug: c.slug }));
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) notFound();

  const all = getCards().map(toMeta);
  const html = await renderCardBody(card.body, all);
  const related = card.related
    .map((r) => all.find((c) => c.slug === r))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

  return (
    <>
      <div className="detail-header">
        <h1>{card.title}</h1>
        <div className="meta-row" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="badge type">{TYPE_LABELS[card.type]}</span>
          <span className={`badge ${card.status}`}>{STATUS_LABELS[card.status]}</span>
          {card.year && <span className="badge">{card.year}</span>}
          {card.tags.map((t) => (
            <span key={t} className="badge">#{t}</span>
          ))}
        </div>
        {card.authors.length > 0 && (
          <div className="kv"><b><T k="detail.authors" /></b> · {card.authors.join(", ")}</div>
        )}
        {card.citation_key && (
          <div className="kv"><b><T k="detail.citationKey" /></b> · <code>{card.citation_key}</code></div>
        )}
        {card.rating && (
          <div className="rating-summary detail-rating">
            <span><T k="review.weight" />: <b>{card.rating.weight}/100</b></span>
            <span><T k="review.recommendation" />: <b>{card.rating.recommendation}</b></span>
            <span><T k="review.innovation" />: <b>{card.rating.innovation}</b></span>
            <span><T k="review.rigor" />: <b>{card.rating.rigor}</b></span>
            <span>{card.rating.count} <T k="review.votes" /></span>
          </div>
        )}
        {card.drive.length > 0 && (
          <div className="kv">
            <b><T k="detail.fulltext" /></b> ·{" "}
            {card.drive.map((d, i) => (
              <a key={d} href={d} target="_blank" rel="noreferrer">
                PDF {i + 1} ↗{" "}
              </a>
            ))}
          </div>
        )}
        {related.length > 0 && (
          <div className="kv">
            <b><T k="detail.related" /></b> ·{" "}
            {related.map((r, i) => (
              <span key={r.slug}>
                {i > 0 && " · "}
                <Link href={`/cards/${r.slug}`}>{r.title}</Link>
              </span>
            ))}
          </div>
        )}
        <div className="btn-row">
          {card.drive.length > 0 && <DownloadButton link={card.drive[0]} />}
          <CopyButton text={cardToPrompt(card, repo)} labelKey="detail.copy" />
          {repo && (
            <a
              className="btn"
              href={`https://github.com/${repo}/blob/main/${card.folder}/${card.slug}.md`}
              target="_blank"
              rel="noreferrer"
            >
              <T k="detail.edit" />
            </a>
          )}
        </div>
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
