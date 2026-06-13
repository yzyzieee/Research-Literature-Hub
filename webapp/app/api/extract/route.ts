import { NextRequest, NextResponse } from "next/server";
import { llmChat, llmConfigured, llmProvider, parseJsonLoose } from "@/lib/llm";
import { driveConfigured, fetchDriveFile } from "@/lib/google";
import { DOMAINS, SOURCE_TYPES } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const TYPES = ["paper", "concept", "algorithm", "resource", "synthesis"];
const MAX_INPUT_CHARS = 60000;
const MAX_TOKENS = 6000;

const SECTIONS: Record<string, string> = {
  paper: "## Summary, ## Key points, ## Method, ## Results, ## My notes, ## References",
  concept: "## Summary, ## Key points, ## Intuition, ## Math, ## My notes, ## References",
  algorithm:
    "## Summary, ## Key points, ## Method, ## When to use, ## Implementation notes, ## My notes, ## References",
  resource: "## Summary, ## Key points, ## When to use, ## How to get it, ## My notes, ## References",
  synthesis: "## Summary, ## Key points, ## Landscape, ## Open questions, ## My notes, ## References",
};

const CARD_JSON_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: TYPES },
    domain: { type: "string", enum: DOMAINS },
    source_type: { type: "string", enum: SOURCE_TYPES },
    title: { type: "string" },
    authors: { type: "array", items: { type: "string" } },
    year: { anyOf: [{ type: "integer" }, { type: "null" }] },
    tags: { type: "array", items: { type: "string" } },
    citation_key: { type: "string" },
    body: { type: "string" },
  },
  required: [
    "type",
    "domain",
    "source_type",
    "title",
    "authors",
    "year",
    "tags",
    "citation_key",
    "body",
  ],
  additionalProperties: false,
};

function buildSystem(fromOriginal: boolean): string {
  return [
    fromOriginal
      ? "You read the original PDF of a research document, including its figures, equations, and tables, for an audio research knowledge base."
      : "You process the extracted text of a research document for an audio research knowledge base.",
    "Classify the document, then produce one English knowledge card.",
    `Allowed types (knowledge kind): ${TYPES.join(", ")}. Most journal and conference articles are "paper".`,
    `Allowed domains (research field; pick the single best fit): ${DOMAINS.join(", ")}. Use "other" only if none fit.`,
    `Allowed source_type (document kind): ${SOURCE_TYPES.join(", ")}.`,
    "Return the fields required by the provided JSON schema.",
    "Tags must be 2-4 lowercase kebab-case keywords ordered broad to narrow. Never include years or author names.",
    "Use a Better-BibTeX-style citation_key: first author surname + year + first significant title word.",
    "Use this section structure for the body:",
    ...Object.entries(SECTIONS).map(([type, sections]) => `  ${type}: ${sections}`),
    "Write clear standard academic English. If a number or claim is uncertain, write (TODO: verify) rather than inventing it.",
    "Keep the body compact, targeting 700-1200 words. The draft is human-reviewed before entering the library.",
  ].join("\n");
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function geminiStructured(parts: GeminiPart[], system: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: CARD_JSON_SCHEMA,
          maxOutputTokens: MAX_TOKENS,
          temperature: 0.2,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const text =
    candidate?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!text.trim()) {
    throw new Error(
      `Gemini returned no content (finish reason: ${finishReason || "unknown"}, block reason: ${
        data.promptFeedback?.blockReason || "none"
      }).`,
    );
  }
  if (finishReason && finishReason !== "STOP") {
    throw new Error(
      finishReason === "MAX_TOKENS"
        ? "Gemini output was truncated. Try again; the response limit has been increased."
        : `Gemini stopped early (${finishReason}).`,
    );
  }
  return text;
}

function shapeCard(card: Record<string, unknown>) {
  const type = TYPES.includes(String(card.type)) ? String(card.type) : "paper";
  const domain = DOMAINS.includes(String(card.domain)) ? String(card.domain) : "other";
  const sourceType = SOURCE_TYPES.includes(String(card.source_type) as never)
    ? String(card.source_type)
    : "other";
  const tags = Array.isArray(card.tags)
    ? card.tags
        .map((tag) =>
          String(tag)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        )
        .filter((tag) => tag && !/^\d{4}$/.test(tag))
        .slice(0, 4)
    : [];

  const shaped = {
    type,
    domain,
    source_type: sourceType,
    title: String(card.title ?? ""),
    authors: Array.isArray(card.authors) ? card.authors.map(String) : [],
    year: card.year ? Number(card.year) : null,
    tags,
    citation_key: String(card.citation_key ?? ""),
    body: String(card.body ?? ""),
  };
  if (!shaped.title.trim() || !shaped.body.trim()) {
    throw new Error("The model returned an incomplete card (missing title or body).");
  }
  return shaped;
}

function invalidCardResponse(raw: string, error: unknown, provider: string) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn("LLM card JSON parse failed", {
    provider,
    rawLength: raw.length,
    error: message,
  });
  return NextResponse.json({ error: `The model returned an invalid card: ${message}` }, { status: 502 });
}

export async function POST(req: NextRequest) {
  const { text, driveFileId } = (await req.json()) as { text?: string; driveFileId?: string };

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
      raw = await geminiStructured(
        [
          { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } },
          { text: "Produce the knowledge card now." },
        ],
        buildSystem(true),
      );
    } catch (error) {
      return NextResponse.json(
        { error: `Vision read failed: ${error instanceof Error ? error.message : error}` },
        { status: 502 },
      );
    }

    try {
      return NextResponse.json(shapeCard(parseJsonLoose(raw)));
    } catch (error) {
      return invalidCardResponse(raw, error, "gemini-vision");
    }
  }

  if (!llmConfigured()) {
    return NextResponse.json(
      { error: "No LLM API key configured. Set a provider API key to enable PDF auto-fill." },
      { status: 501 },
    );
  }
  if (!text || text.trim().length < 80) {
    return NextResponse.json(
      { error: "No usable text was extracted from the PDF. It may be a scanned or image-only document." },
      { status: 400 },
    );
  }

  let raw: string;
  try {
    const user = `Full document text:\n\n${text.slice(0, MAX_INPUT_CHARS)}`;
    raw =
      llmProvider() === "gemini"
        ? await geminiStructured([{ text: user }], buildSystem(false))
        : await llmChat({
            system: buildSystem(false),
            user,
            maxTokens: MAX_TOKENS,
            json: true,
          });
  } catch (error) {
    return NextResponse.json(
      { error: `LLM error: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }

  try {
    return NextResponse.json(shapeCard(parseJsonLoose(raw)));
  } catch (error) {
    return invalidCardResponse(raw, error, llmProvider());
  }
}
