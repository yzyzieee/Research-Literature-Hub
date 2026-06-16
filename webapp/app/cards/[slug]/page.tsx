import Link from "next/link";
import { notFound } from "next/navigation";
import { getCards, toMeta } from "@/lib/kb";
import { getCardRemote, getCardsRemote } from "@/lib/kb-remote";
import { renderCardBody } from "@/lib/markdown";
import { cardToBibtex, cardToPrompt, driveViewUrl } from "@/lib/export";
import { domainLabel, publicationTypeLabel } from "@/lib/types";
import { T } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";
import CommentsPanel from "@/components/CommentsPanel";
import DownloadButton from "@/components/DownloadButton";
import KeyReferencesPanel from "@/components/KeyReferencesPanel";
import CardActions from "@/components/CardActions";
import KeyFigurePanel from "@/components/KeyFigurePanel";

export const revalidate = 300;

export function generateStaticParams() {
  return getCards().map((c) => ({ slug: c.slug }));
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCardRemote(slug);
  if (!card) notFound();

  const all = (await getCardsRemote()).map(toMeta);
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
          <span className="badge domain">{domainLabel(card.primary_domain)}</span>
          {card.domains
            .filter((domain) => domain !== card.primary_domain)
            .map((domain) => (
              <span className="badge" key={domain}>{domainLabel(domain)}</span>
            ))}
          {card.publication_type && (
            <span className="badge type">{publicationTypeLabel(card.publication_type)}</span>
          )}
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
        {card.venue && (
          <div className="kv"><b><T k="detail.venue" /></b> · {card.venue}</div>
        )}
        {card.doi && (
          <div className="kv">
            <b><T k="detail.doi" /></b> ·{" "}
            <a href={`https://doi.org/${card.doi}`} target="_blank" rel="noreferrer">{card.doi}</a>
          </div>
        )}
        {card.abstract && (
          <div className="abstract-box">
            <b><T k="detail.abstract" /></b>
            <p>{card.abstract}</p>
          </div>
        )}
        <KeyFigurePanel
          slug={card.slug}
          initialFigure={card.key_figure}
          pdfLink={card.drive[0] || ""}
          persist
        />
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
          {card.drive.length > 0 && (
            <a className="btn" href={driveViewUrl(card.drive[0])} target="_blank" rel="noreferrer">
              👁 <T k="card.view" />
            </a>
          )}
          {card.drive.length > 0 && <DownloadButton link={card.drive[0]} />}
          <CopyButton text={cardToBibtex(card)} labelKey="detail.copyBibtex" />
          <CopyButton text={cardToPrompt(card, repo)} labelKey="detail.copy" />
        </div>
        {card.entry_type === "literature" && (
          <CardActions slug={card.slug} creator={card.uploaded_by} repo={repo} />
        )}
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      <KeyReferencesPanel references={card.key_references} />
      <CommentsPanel slug={card.slug} initialComments={card.comments} />
      {(card.uploaded_by || card.pdf_uploaded_by || card.activity.length > 0) && (
        <details className="activity-footer">
          <summary><T k="detail.activity" /></summary>
          {(card.uploaded_by || card.pdf_uploaded_by) && (
            <div className="audit-box">
              {card.uploaded_by && (
                <span><T k="detail.uploadedBy" />: {card.uploaded_by}{card.uploaded_at ? ` · ${card.uploaded_at}` : ""}</span>
              )}
              {card.pdf_uploaded_by && (
                <span>
                  <T k="detail.pdfUploadedBy" />: {card.pdf_uploaded_by}
                  {card.pdf_uploaded_at ? ` · ${card.pdf_uploaded_at}` : ""}
                  {card.pdf_file_name ? ` · ${card.pdf_file_name}` : ""}
                </span>
              )}
            </div>
          )}
          {card.activity.length > 0 && (
            <div className="audit-box">
              <b><T k="detail.auditTrail" /></b>
              <ol className="audit-list">
                {[...card.activity].reverse().map((entry, index) => (
                  <li key={`${entry.at}-${entry.action}-${index}`}>
                    <span>{entry.action.replaceAll("_", " ")}</span>
                    <strong>{entry.by}</strong>
                    <time>{entry.at}</time>
                    {entry.detail && <small>{entry.detail}</small>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </details>
      )}
    </>
  );
}
