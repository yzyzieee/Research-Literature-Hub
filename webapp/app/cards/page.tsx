import { getCards, toMeta } from "@/lib/kb";
import CardSearch from "@/components/CardSearch";

export const dynamic = "force-static";

export default function CardsPage() {
  const cards = getCards().map(toMeta);
  return (
    <>
      <h1>卡片库 Library</h1>
      <p className="subtitle">全部卡片（含待审核），客户端即时搜索</p>
      <CardSearch cards={cards} />
    </>
  );
}
