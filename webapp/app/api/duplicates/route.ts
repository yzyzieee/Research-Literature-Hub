import { NextRequest, NextResponse } from "next/server";
import { findDuplicateCandidates } from "@/lib/duplicates";
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
  return NextResponse.json({
    candidates: findDuplicateCandidates(getCards(), body),
  });
}
