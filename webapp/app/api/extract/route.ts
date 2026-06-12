import { NextRequest, NextResponse } from "next/server";
import { llmChat, llmConfigured, parseJsonLoose } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 120;

const TYPES = ["paper", "concept", "algorithm", "resource", "synthesis"];
// Send (close to) the whole paper so the distillation reflects the full text,
// not just the first pages. ~60k chars ≈ 15-20k tokens — within DeepSeek's
// context and still cheap. Most articles fit comfortably under this.
const MAX_INPUT_CHARS = 60000;
const MAX_TOKENS = 3000;

const SECTIONS: Record<string, string> = {
  paper: "## Summary, ## Key points, ## Method, ## Results, ## My notes, ## References",
  concept: "## Summary, ## Key points, ## Intuition, ## Math, ## My notes, ## References",
  algorithm: "## Summary, ## Key points, ## Method, ## When to use, ## Implementation notes, ## My notes, ## References",
  resource: "## Summary, ## Key points, ## When to use, ## How to get it, ## My notes, ## References",
  synthesis: "## Summary, ## Key points, ## Landscape, ## Open questions, ## My notes, ## References",
};

export async function POST(req: NextRequest) {
  if (!llmConfigured()) {
    return NextResponse.json(
      { error: "No LLM API key configured — set one (e.g. DEEPSEEK_API_KEY) to enable PDF auto-extraction." },
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

  let raw: string;
  try {
    raw = await llmChat({
      system,
      user: `Full document text:\n\n${text.slice(0, MAX_INPUT_CHARS)}`,
      maxTokens: MAX_TOKENS,
      json: true,
    });
  } catch (e) {
    return NextResponse.json({ error: `LLM error: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }
  let card: Record<string, unknown>;
  try {
    card = parseJsonLoose(raw);
  } catch {
    return NextResponse.json({ error: "The model did not return valid JSON — try again or fill manually." }, { status: 502 });
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
  });
}
