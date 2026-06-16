import { Suspense } from "react";
import { toMeta } from "@/lib/kb";
import { getCardsRemote } from "@/lib/kb-remote";
import { isLiterature } from "@/lib/types";
import { T } from "@/lib/i18n";
import CardSearch from "@/components/CardSearch";

export const revalidate = 300;

export default async function CardsPage() {
  const cards = (await getCardsRemote()).filter(isLiterature).map(toMeta);
  return (
    <>
      <h1><T k="cards.title" /></h1>
      <p className="subtitle"><T k="cards.subtitle" /></p>
      <Suspense fallback={null}>
        <CardSearch cards={cards} />
      </Suspense>
    </>
  );
}
