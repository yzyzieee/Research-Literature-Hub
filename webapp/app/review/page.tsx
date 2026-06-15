import { toMeta } from "@/lib/kb";
import { getCardsRemote } from "@/lib/kb-remote";
import { T } from "@/lib/i18n";
import ReviewRatings from "@/components/ReviewRatings";
import { isLiterature } from "@/lib/types";

export const revalidate = 300;

export default async function ReviewPage() {
  const papers = (await getCardsRemote())
    .filter((card) => card.folder === "official" && isLiterature(card))
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
