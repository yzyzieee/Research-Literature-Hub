import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const TYPES = ["paper", "concept", "algorithm", "resource", "synthesis"];
const MAX_INPUT_CHARS = 16000;
const MAX_TOKENS = 3000;

const SECTIONS: Record<string, string> = {
  paper: "## Summary, ## Key points, ## Method, ## Results, ## My notes, ## References",
  concept: "## Summary, ## Key points, ## Intuition, ## Math, ## My notes, ## References",
  algorithm: "## Summary, ## Key points, ## Method, ## When to use, ## Implementation notes, ## My notes, ## References",
  resource: "## Summary, ## Key points, ## When to use, ## How to get it, ## My notes, ## References",
  synthesis: "## Summary, ## Key points, ## Landscape, ## Open questions, ## My notes, ## References",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured — set it in .env.local / Vercel to enable PDF auto-extraction." },
      { status: 501 },
    );
  }
  const { text } = (await req.json()) as { text?: string };
  if (!text || text.trim().length < 80) {
    return NextResponse.json(
      { error: "No usable text extracted from the PDF (it may be a scan/image — try a text PDF or fill the card manually)." },
      { status: 400 },
    );
  }

  const system = [
    "You process the extracted text of a research document for an audio / active-noise-control / signal-processing knowledge base.",
    "First classify the document into exactly one type, then produce a single English knowledge card.",
    `Allowed types: ${TYPES.join(", ")}. Most journal/conference articles are "paper".`,
    "Respond with a JSON object only, with these keys:",
    '- "type": one of the allowed types',
    '- "title": the document title (English)',
    '- "authors": array of author names (empty array if not a paper / unknown)',
    '- "year": integer publication year or null',
    '- "tags": array of 2-5 lowercase kebab-case topic tags',
    '- "citation_key": a Better-BibTeX-style key, lowercase, e.g. "widrow1975adaptive" (firstauthor + year + first significant title word)',
    '- "body": the markdown card body following the section structure for the chosen type',
    "Section structure by type:",
    ...Object.entries(SECTIONS).map(([t, s]) => `  ${t}: ${s}`),
    "Within the body, write clear standard academic English. Be conservative: if a number or claim is uncertain, write (TODO: verify) rather than inventing it.",
    "Keep it compact — a knowledge card, not a full reproduction. The draft is human-reviewed before entering the library.",
  ].join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
      max_tokens: MAX_TOKENS,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Document text (beginning):\n\n${text.slice(0, MAX_INPUT_CHARS)}` },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    return NextResponse.json({ error: `DeepSeek API error ${res.status}: ${t.slice(0, 300)}` }, { status: 502 });
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  let card: Record<string, unknown>;
  try {
    card = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "DeepSeek did not return valid JSON — try again or fill manually." }, { status: 502 });
  }

  const type = TYPES.includes(String(card.type)) ? String(card.type) : "paper";
  return NextResponse.json({
    type,
    title: String(card.title ?? ""),
    authors: Array.isArray(card.authors) ? card.authors.map(String) : [],
    year: card.year ? Number(card.year) : null,
    tags: Array.isArray(card.tags)
      ? card.tags.map((t) =>
          String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        )
      : [],
    citation_key: String(card.citation_key ?? ""),
    body: String(card.body ?? ""),
    usage: data.usage,
  });
}
