import { NextRequest, NextResponse } from "next/server";
import { bundlePrompt, estimateTokens } from "@/lib/export";
import { getCards } from "@/lib/kb";
import { isLiterature } from "@/lib/types";

export const runtime = "nodejs";

const MAX_SELECTED = 25;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { slugs?: string[] };
  const slugs = [...new Set((body.slugs || []).map(String).filter(Boolean))];
  if (!slugs.length) {
    return NextResponse.json({ error: "Select at least one paper." }, { status: 400 });
  }
  if (slugs.length > MAX_SELECTED) {
    return NextResponse.json(
      { error: `Select at most ${MAX_SELECTED} papers for a full context pack.` },
      { status: 400 },
    );
  }

  const wanted = new Set(slugs);
  const cards = getCards().filter((card) => isLiterature(card) && wanted.has(card.slug));
  if (cards.length !== wanted.size) {
    return NextResponse.json({ error: "One or more selected papers were not found." }, { status: 404 });
  }

  const order = new Map(slugs.map((slug, index) => [slug, index]));
  cards.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  const bundle = bundlePrompt(cards, process.env.NEXT_PUBLIC_GITHUB_REPO);
  return NextResponse.json({
    bundle,
    count: cards.length,
    estimatedTokens: estimateTokens(bundle),
  });
}
