import Link from "next/link";
import { toMeta } from "@/lib/kb";
import { getCardsRemote } from "@/lib/kb-remote";
import { isLiterature } from "@/lib/types";
import { T } from "@/lib/i18n";
import CardListItem from "@/components/CardListItem";

export const revalidate = 300;

export default async function HomePage() {
  const cards = (await getCardsRemote()).filter(isLiterature);
  const official = cards.filter((c) => c.folder !== "pending");
  const rated = official.filter((c) => c.rating);
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
