import { getCards, toMeta } from "@/lib/kb";
import { T } from "@/lib/i18n";
import ReviewRatings from "@/components/ReviewRatings";

export const dynamic = "force-static";

export default function ReviewPage() {
  const papers = getCards()
    .filter((card) => card.folder === "official" && card.type === "paper")
    .sort((a, b) => (b.rating?.weight || 0) - (a.rating?.weight || 0))
    .map(toMeta);

  return (
    <>
      <h1><T k="review.title" /></h1>
      <p className="subtitle"><T k="review.subtitle" /></p>
      <div className="checklist">
        <b><T k="review.formula" /></b>
        <p><T k="review.formulaHint" /></p>
      </div>
      <ReviewRatings cards={papers} />
    </>
  );
}
