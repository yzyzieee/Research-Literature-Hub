import { getCards, toMeta } from "@/lib/kb";
import { T } from "@/lib/i18n";
import CardListItem from "@/components/CardListItem";

export const dynamic = "force-static";

export default function PendingPage() {
  const pending = getCards().filter((c) => c.folder === "pending");
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

  return (
    <>
      <h1><T k="pending.title" /></h1>
      <p className="subtitle">
        <T k="pending.subtitle" />
        {repo && (
          <>
            {" "}
            <a href={`https://github.com/${repo}/pulls`} target="_blank" rel="noreferrer">
              <T k="pending.openPRs" />
            </a>
          </>
        )}
      </p>

      <div className="checklist">
        <b><T k="pending.checklist" /></b>
        <ul>
          <li><T k="pending.c1" /></li>
          <li><T k="pending.c2" /></li>
          <li><T k="pending.c3" /></li>
          <li><T k="pending.c4" /></li>
        </ul>
      </div>

      <h2>
        {pending.length} <T k="pending.count" />
      </h2>
      <div className="card-grid">
        {pending.map((c) => (
          <CardListItem key={c.slug} card={toMeta(c)} />
        ))}
      </div>
      {pending.length === 0 && <p className="subtitle"><T k="pending.empty" /></p>}
    </>
  );
}
