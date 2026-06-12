import Link from "next/link";
import { getCards, toMeta } from "@/lib/kb";
import { TYPE_LABELS } from "@/lib/types";
import type { CardType } from "@/lib/types";
import CardListItem from "@/components/CardListItem";

export const dynamic = "force-static";

export default function HomePage() {
  const cards = getCards();
  const official = cards.filter((c) => c.folder !== "90_pending");
  const pending = cards.filter((c) => c.folder === "90_pending");
  const byType = (Object.keys(TYPE_LABELS) as CardType[]).map((t) => ({
    type: t,
    count: official.filter((c) => c.type === t).length,
  }));
  const recent = [...cards]
    .sort((a, b) => (b.created || "").localeCompare(a.created || ""))
    .slice(0, 5);

  return (
    <>
      <h1>音频研究知识库</h1>
      <p className="subtitle">Collaborative bilingual knowledge base · audio / ANC / signal processing</p>

      <div className="stat-grid">
        <div className="stat">
          <div className="num">{official.length}</div>
          <div className="label">正式卡片 official</div>
        </div>
        <div className="stat">
          <div className="num">{pending.length}</div>
          <div className="label">待审核 pending</div>
        </div>
        {byType
          .filter((t) => t.count > 0)
          .map((t) => (
            <div className="stat" key={t.type}>
              <div className="num">{t.count}</div>
              <div className="label">{TYPE_LABELS[t.type]}</div>
            </div>
          ))}
      </div>

      {pending.length > 0 && (
        <>
          <h2>
            待审核 <Link href="/pending" style={{ fontSize: 14 }}>查看队列 →</Link>
          </h2>
          <div className="card-grid">
            {pending.slice(0, 3).map((c) => (
              <CardListItem key={c.slug} card={toMeta(c)} />
            ))}
          </div>
        </>
      )}

      <h2>
        最近更新 <Link href="/cards" style={{ fontSize: 14 }}>浏览全部 →</Link>
      </h2>
      <div className="card-grid">
        {recent.map((c) => (
          <CardListItem key={c.slug} card={toMeta(c)} />
        ))}
      </div>
    </>
  );
}
