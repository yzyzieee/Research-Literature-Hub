import { notFound } from "next/navigation";
import CardEditor from "@/components/CardEditor";
import { T } from "@/lib/i18n";
import { getCards } from "@/lib/kb";
import { getCardRemote } from "@/lib/kb-remote";

export const revalidate = 300;

export function generateStaticParams() {
  return getCards()
    .filter((card) => card.folder === "official" && card.entry_type === "literature")
    .map((card) => ({ slug: card.slug }));
}

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = await getCardRemote(slug);
  if (!card || card.folder !== "official" || card.entry_type !== "literature") notFound();

  return (
    <>
      <h1><T k="edit.title" /></h1>
      <p className="subtitle"><T k="edit.subtitle" /> · {card.title}</p>
      <CardEditor slug={slug} />
    </>
  );
}
