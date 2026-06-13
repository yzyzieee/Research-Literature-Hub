import { NextRequest, NextResponse } from "next/server";
import { llmChat, llmConfigured, llmProvider, parseJsonLoose } from "@/lib/llm";
import { driveConfigured, fetchDriveFile } from "@/lib/google";
import { DOMAINS, SOURCE_TYPES } from "@/lib/types";

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

function buildSystem(fromOriginal: boolean): string {
  return [
    fromOriginal
      ? "You read the original PDF of a research document (including its figures, equations and tables) for an audio / active-noise-control / signal-processing knowledge base."
      : "You process the extracted text of a research document for an audio / active-noise-control / signal-processing knowledge base.",
    "Classify the document, then produce a single English knowledge card.",
    `Allowed types (knowledge kind): ${TYPES.join(", ")}. Most journal/conference articles are "paper".`,
    `Allowed domains (research field — pick the single best fit): ${DOMAINS.join(", ")}. Use "other" only if none fit.`,
    `Allowed source_type (document kind): ${SOURCE_TYPES.join(", ")}.`,
    "Respond with a JSON object only, with these keys:",
    '- "type": one of the allowed types',
    '- "domain": one of the allowed domains',
    '- "source_type": one of the allowed source_type values',
    '- "title": the document title (English)',
    '- "authors": array of author names (empty array if not a paper / unknown)',
    '- "year": integer publication year or null',
    '- "tags": array of 2-4 lowercase kebab-case keywords ordered broad to narrow (e.g. ["anc", "adaptive-filter", "fxlms"]). NEVER include years or author names.',
    '- "citation_key": a Better-BibTeX-style key, lowercase, e.g. "widrow1975adaptive" (firstauthor + year + first significant title word)',
    '- "body": the markdown card body following the section structure for the chosen type',
    "Section structure by type:",
    ...Object.entries(SECTIONS).map(([t, s]) => `  ${t}: ${s}`),
    "Within the body, write clear standard academic English. Be conservative: if a number or claim is uncertain, write (TODO: verify) rather than inventing it.",
    "Keep it compact — a knowledge card, not a full reproduction. The draft is human-reviewed before entering the library.",
  ].join("\n");
}

// Gemini reads the actual PDF pages (figures + equations), not just text.
async function geminiVision(pdfBase64: string, system: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          {
            parts: [
              { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
              { text: "Produce the knowledge card JSON now." },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: MAX_TOKENS,
          temperature: 0.2,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini vision ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function shapeCard(card: Record<string, unknown>) {
  const type = TYPES.includes(String(card.type)) ? String(card.type) : "paper";
  const domain = DOMAINS.includes(String(card.domain)) ? String(card.domain) : "other";
  const source_type = SOURCE_TYPES.includes(String(card.source_type) as never)
    ? String(card.source_type)
    : "";
  const tags = Array.isArray(card.tags)
    ? card.tags
        .map((t) => String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
        // drop years and empty tokens — tags are domain keywords only
        .filter((t) => t && !/^\d{4}$/.test(t))
    : [];
  return {
    type,
    domain,
    source_type,
    title: String(card.title ?? ""),
    authors: Array.isArray(card.authors) ? card.authors.map(String) : [],
    year: card.year ? Number(card.year) : null,
    tags,
    citation_key: String(card.citation_key ?? ""),
    body: String(card.body ?? ""),
  };
}

export async function POST(req: NextRequest) {
  const { text, driveFileId } = (await req.json()) as { text?: string; driveFileId?: string };

  // Vision path: Gemini reads the original PDF fetched from Drive.
  if (driveFileId) {
    if (llmProvider() !== "gemini" || !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Reading the original PDF needs the Gemini provider (set LLM_PROVIDER=gemini)." },
        { status: 400 },
      );
    }
    if (!driveConfigured()) {
      return NextResponse.json({ error: "Drive is not configured." }, { status: 400 });
    }
    let raw: string;
    try {
      const pdf = await fetchDriveFile(driveFileId);
      raw = await geminiVision(pdf.toString("base64"), buildSystem(true));
    } catch (e) {
      return NextResponse.json({ error: `vision read failed: ${e instanceof Error ? e.message : e}` }, { status: 502 });
    }
    try {
      return NextResponse.json(shapeCard(parseJsonLoose(raw)));
    } catch {
      return NextResponse.json({ error: "Gemini did not return valid JSON — keep the text-based draft." }, { status: 502 });
    }
  }

  // Text path: extracted text → configured LLM provider.
  if (!llmConfigured()) {
    return NextResponse.json(
      { error: "No LLM API key configured — set one (e.g. DEEPSEEK_API_KEY) to enable PDF auto-extraction." },
      { status: 501 },
    );
  }
  if (!text || text.trim().length < 80) {
    return NextResponse.json(
      { error: "No usable text extracted from the PDF (it may be a scan/image — try a text PDF or fill the card manually)." },
      { status: 400 },
    );
  }

  let raw: string;
  try {
    raw = await llmChat({
      system: buildSystem(false),
      user: `Full document text:\n\n${text.slice(0, MAX_INPUT_CHARS)}`,
      maxTokens: MAX_TOKENS,
      json: true,
    });
  } catch (e) {
    return NextResponse.json({ error: `LLM error: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }
  try {
    return NextResponse.json(shapeCard(parseJsonLoose(raw)));
  } catch {
    return NextResponse.json({ error: "The model did not return valid JSON — try again or fill manually." }, { status: 502 });
  }
}
