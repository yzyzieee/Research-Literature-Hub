import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const doi = req.nextUrl.searchParams.get("doi")?.trim();
  if (!doi) {
    return NextResponse.json({ error: "missing doi parameter" }, { status: 400 });
  }
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { "User-Agent": "audio-research-kb (mailto:team@example.com)" },
  });
  if (!res.ok) {
    return NextResponse.json({ error: `Crossref lookup failed (${res.status})` }, { status: 502 });
  }
  const data = await res.json();
  const work = data.message;
  const title: string = work.title?.[0] ?? "";
  const authors: string[] = (work.author ?? []).map(
    (a: { given?: string; family?: string }) => [a.given, a.family].filter(Boolean).join(" "),
  );
  const year: number | null = work.issued?.["date-parts"]?.[0]?.[0] ?? null;
  const firstFamily = (work.author?.[0]?.family ?? "unknown")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z]/g, "");
  const firstWord = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .find((w) => w.length > 3 && !["with", "from", "this", "that", "using"].includes(w)) ?? "paper";
  return NextResponse.json({
    title,
    authors,
    year,
    venue: work["container-title"]?.[0] ?? "",
    citation_key: `${firstFamily}${year ?? ""}${firstWord}`,
    doi,
  });
}
