import { toExportMeta } from "@/lib/kb";
import { getCardsRemote } from "@/lib/kb-remote";
import { T } from "@/lib/i18n";
import ExportBuilder from "@/components/ExportBuilder";
import { isLiterature } from "@/lib/types";

export const revalidate = 300;

export default async function ExportPage() {
  const cards = (await getCardsRemote()).filter(isLiterature).map(toExportMeta);
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  return (
    <>
      <h1><T k="export.title" /></h1>
      <p className="subtitle"><T k="export.subtitle" /></p>
      <ExportBuilder cards={cards} repo={repo} />
    </>
  );
}
