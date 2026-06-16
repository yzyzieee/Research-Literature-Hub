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
  const firstDrive = card.drive[0] || "";

  return (
    <>
      <div className="detail-header">
        <h1>{card.title}</h1>
        <div className="meta-row detail-chip-row">
          <Link className="badge domain badge-tag" href={`/cards?domain=${encodeURIComponent(card.primary_domain)}`}>
            {domainLabel(card.primary_domain)}
          </Link>
          {card.domains
            .filter((domain) => domain !== card.primary_domain)
            .map((domain) => (
              <Link className="badge badge-tag" key={domain} href={`/cards?domain=${encodeURIComponent(domain)}`}>
                {domainLabel(domain)}
              </Link>
            ))}
          {card.publication_type && (
            <Link className="badge type badge-tag" href={`/cards?type=${encodeURIComponent(card.publication_type)}`}>
              {publicationTypeLabel(card.publication_type)}
            </Link>
          )}
          {card.year && (
            <Link className="badge badge-tag" href={`/cards?year=${encodeURIComponent(String(card.year))}`}>
              {card.year}
            </Link>
          )}
          {card.venue && (
            <Link className="badge badge-tag venue" href={`/cards?venue=${encodeURIComponent(card.venue)}`}>
              {card.venue}
            </Link>
          )}
          {card.tags.map((tag) => (
            <Link key={tag} className="badge badge-tag" href={`/cards?tag=${encodeURIComponent(tag)}`}>
              #{tag}
            </Link>
          ))}
        </div>
        {card.authors.length > 0 && (
          <div className="kv"><b><T k="detail.authors" /></b> - {card.authors.join(", ")}</div>
        )}
        {card.citation_key && (
          <div className="kv"><b><T k="detail.citationKey" /></b> - <code>{card.citation_key}</code></div>
        )}
        {card.venue && (
          <div className="kv">
            <b><T k="detail.venue" /></b> -{" "}
            <Link href={`/cards?venue=${encodeURIComponent(card.venue)}`}>{card.venue}</Link>
          </div>
        )}
        {card.doi && (
          <div className="kv">
            <b><T k="detail.doi" /></b> -{" "}
            <a href={`https://doi.org/${card.doi}`} target="_blank" rel="noreferrer">{card.doi}</a>
          </div>
        )}
        <div className="btn-row detail-actions">
          {firstDrive && (
            <a className="btn primary" href={driveViewUrl(firstDrive)} target="_blank" rel="noreferrer">
              <T k="card.view" />
            </a>
          )}
          {firstDrive && <DownloadButton link={firstDrive} />}
          <CopyButton text={cardToBibtex(card)} labelKey="detail.copyBibtex" />
          <CopyButton text={cardToPrompt(card, repo)} labelKey="detail.copy" />
          {card.entry_type === "literature" && (
            <CardActions slug={card.slug} creator={card.uploaded_by} />
          )}
        </div>
        {card.abstract && (
          <details className="abstract-box abstract-box-collapsible">
            <summary>
              <span className="abstract-summary-head">
                <b><T k="detail.abstract" /></b>
                <span className="abstract-expand"><T k="detail.expandAbstract" /></span>
                <span className="abstract-collapse"><T k="detail.collapseAbstract" /></span>
              </span>
              <p className="abstract-preview">{card.abstract}</p>
            </summary>
            <p className="abstract-full">{card.abstract}</p>
          </details>
        )}
        <KeyFigurePanel
          slug={card.slug}
          initialFigure={card.key_figure}
          pdfLink={firstDrive}
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
          <div className="kv detail-fulltext">
            <b><T k="detail.fulltext" /></b> -{" "}
            {card.drive.map((driveLink, index) => (
              <a key={driveLink} href={driveLink} target="_blank" rel="noreferrer">
                PDF {index + 1} ↗{" "}
              </a>
            ))}
          </div>
        )}
        {related.length > 0 && (
          <div className="kv">
            <b><T k="detail.related" /></b> -{" "}
            {related.map((item, index) => (
              <span key={item.slug}>
                {index > 0 && " - "}
                <Link href={`/cards/${item.slug}`}>{item.title}</Link>
              </span>
            ))}
          </div>
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
                <span><T k="detail.uploadedBy" />: {card.uploaded_by}{card.uploaded_at ? ` - ${card.uploaded_at}` : ""}</span>
              )}
              {card.pdf_uploaded_by && (
                <span>
                  <T k="detail.pdfUploadedBy" />: {card.pdf_uploaded_by}
                  {card.pdf_uploaded_at ? ` - ${card.pdf_uploaded_at}` : ""}
                  {card.pdf_file_name ? ` - ${card.pdf_file_name}` : ""}
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
