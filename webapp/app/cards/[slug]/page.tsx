import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard, getCards, toMeta } from "@/lib/kb";
import { renderCardBody } from "@/lib/markdown";
import { cardToPrompt } from "@/lib/export";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

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
        {card.title_zh && <div className="zh-title">{card.title_zh}</div>}
        <div className="meta-row" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="badge type">{TYPE_LABELS[card.type]}</span>
          <span className={`badge ${card.status}`}>{STATUS_LABELS[card.status]}</span>
          {card.year && <span className="badge">{card.year}</span>}
          {card.tags.map((t) => (
            <span key={t} className="badge">#{t}</span>
          ))}
        </div>
        {card.authors.length > 0 && (
          <div className="kv"><b>Authors</b> · {card.authors.join(", ")}</div>
        )}
        {card.citation_key && (
          <div className="kv"><b>Citation key</b> · <code>{card.citation_key}</code></div>
        )}
        {card.drive.length > 0 && (
          <div className="kv">
            <b>Drive</b> ·{" "}
            {card.drive.map((d, i) => (
              <a key={d} href={d} target="_blank" rel="noreferrer">
                PDF/资料 {i + 1} ↗{" "}
              </a>
            ))}
          </div>
        )}
        {related.length > 0 && (
          <div className="kv">
            <b>Related</b> ·{" "}
            {related.map((r, i) => (
              <span key={r.slug}>
                {i > 0 && " · "}
                <Link href={`/cards/${r.slug}`}>{r.title}</Link>
              </span>
            ))}
          </div>
        )}
        <div className="btn-row">
          <CopyButton text={cardToPrompt(card, repo)} label="📋 复制喂给你的 LLM" />
          {repo && (
            <a
              className="btn"
              href={`https://github.com/${repo}/blob/main/${card.folder}/${card.slug}.md`}
              target="_blank"
              rel="noreferrer"
            >
              在 GitHub 上编辑 ↗
            </a>
          )}
        </div>
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
