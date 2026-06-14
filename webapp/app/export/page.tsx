import { getCards, toExportMeta } from "@/lib/kb";
import { T } from "@/lib/i18n";
import ExportBuilder from "@/components/ExportBuilder";
import { isLiterature } from "@/lib/types";

export const dynamic = "force-static";

export default function ExportPage() {
  const cards = getCards().filter(isLiterature).map(toExportMeta);
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  return (
    <>
      <h1><T k="export.title" /></h1>
      <p className="subtitle"><T k="export.subtitle" /></p>
      <ExportBuilder cards={cards} repo={repo} />
    </>
  );
}
