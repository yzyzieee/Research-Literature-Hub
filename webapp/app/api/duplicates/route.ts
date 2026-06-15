import { NextRequest, NextResponse } from "next/server";
import { findDuplicateCandidates } from "@/lib/duplicates";
import { listGitHubDirectoryPaths } from "@/lib/github-content";
import { getCards } from "@/lib/kb";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    title?: string;
    doi?: string;
    citation_key?: string;
    authors?: string[];
    year?: number | null;
  };
  if (!String(body.title || "").trim() && !String(body.doi || "").trim() && !String(body.citation_key || "").trim()) {
    return NextResponse.json({ error: "Title, DOI, or citation key is required." }, { status: 400 });
  }
  let cards = getCards();
  try {
    const paths = await listGitHubDirectoryPaths("official");
    const liveOfficialSlugs = new Set(
      paths
        .filter((path) => path.startsWith("official/") && path.endsWith(".md"))
        .map((path) => path.slice("official/".length, -".md".length)),
    );
    cards = cards.filter(
      (card) => card.folder !== "official" || liveOfficialSlugs.has(card.slug),
    );
  } catch {
    // Static metadata remains a safe fallback when GitHub is temporarily unavailable.
  }
  return NextResponse.json({ candidates: findDuplicateCandidates(cards, body) });
}
