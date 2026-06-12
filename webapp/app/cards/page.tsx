import { getCards, toMeta } from "@/lib/kb";
import { T } from "@/lib/i18n";
import CardSearch from "@/components/CardSearch";

export const dynamic = "force-static";

export default function CardsPage() {
  const cards = getCards().map(toMeta);
  return (
    <>
      <h1><T k="cards.title" /></h1>
      <p className="subtitle"><T k="cards.subtitle" /></p>
      <CardSearch cards={cards} />
    </>
  );
}
