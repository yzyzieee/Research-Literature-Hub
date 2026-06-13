import Link from "next/link";
import { getCards, toMeta } from "@/lib/kb";
import { TYPE_LABELS } from "@/lib/types";
import type { CardType } from "@/lib/types";
import { T } from "@/lib/i18n";
import CardListItem from "@/components/CardListItem";

export const dynamic = "force-static";

export default function HomePage() {
  const cards = getCards();
  const official = cards.filter((c) => c.folder !== "pending");
  const rated = official.filter((c) => c.rating);
  const byType = (Object.keys(TYPE_LABELS) as CardType[]).map((t) => ({
    type: t,
    count: official.filter((c) => c.type === t).length,
  }));
  const recent = [...cards]
    .sort((a, b) => (b.created || "").localeCompare(a.created || ""))
    .slice(0, 5);

  return (
    <>
      <h1><T k="home.title" /></h1>
      <p className="subtitle"><T k="home.subtitle" /></p>

      <div className="stat-grid">
        <div className="stat">
          <div className="num">{official.length}</div>
          <div className="label"><T k="home.official" /></div>
        </div>
        <div className="stat">
          <div className="num">{rated.length}</div>
          <div className="label"><T k="home.rated" /></div>
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

      <h2>
        <T k="home.recent" /> <Link href="/cards" style={{ fontSize: 14 }}><T k="home.browseAll" /></Link>
      </h2>
      <div className="card-grid">
        {recent.map((c) => (
          <CardListItem key={c.slug} card={toMeta(c)} />
        ))}
      </div>
    </>
  );
}
