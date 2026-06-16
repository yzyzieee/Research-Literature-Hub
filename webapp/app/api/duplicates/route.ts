import { NextRequest, NextResponse } from "next/server";
import { findDuplicateCandidates } from "@/lib/duplicates";
import { getCardsRemote } from "@/lib/kb-remote";

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
  // Live card read (falls back to the on-disk snapshot if GitHub is down) so a
  // paper a teammate just published is still flagged before this one is created.
  const cards = await getCardsRemote();
  return NextResponse.json({ candidates: findDuplicateCandidates(cards, body) });
}
