import { NextRequest, NextResponse } from "next/server";
import { guestLiteratureDraft, isGuest } from "@/lib/guest";
import { llmChat, llmConfigured, llmProvider, parseJsonLoose } from "@/lib/llm";
import { driveConfigured, fetchDriveFile } from "@/lib/google";
import { DOMAINS, PUBLICATION_TYPES } from "@/lib/types";
import { getCards } from "@/lib/kb";
import { linkKeyReferences, parseKeyReferences } from "@/lib/key-references";
import { aiKeyFigure, parseKeyFigureCandidates } from "@/lib/key-figure";
import { normalizedTitle } from "@/lib/duplicates";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_INPUT_CHARS = 60000;
const MAX_TOKENS = 7000;

const LITERATURE_JSON_SCHEMA = {
  type: "object",
  properties: {
    entry_type: { type: "string", enum: ["literature"] },
    primary_domain: { type: "string", enum: DOMAINS },
    domains: {
      type: "array",
      items: { type: "string", enum: DOMAINS },
      minItems: 1,
      uniqueItems: true,
    },
    publication_type: { type: "string", enum: PUBLICATION_TYPES },
    title: { type: "string" },
    authors: { type: "array", items: { type: "string" } },
    year: { anyOf: [{ type: "integer" }, { type: "null" }] },
    venue: { type: "string" },
    doi: { type: "string" },
    abstract: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    citation_key: { type: "string" },
    key_references: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          doi: { type: "string" },
          year: { anyOf: [{ type: "integer" }, { type: "null" }] },
          role: {
            type: "string",
            enum: ["foundation", "method", "baseline", "dataset", "survey", "related_work"],
          },
          reason: { type: "string" },
        },
        required: ["title", "doi", "year", "role", "reason"],
        additionalProperties: false,
      },
    },
    key_figure: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["none", "suggested"] },
        figure_id: { anyOf: [{ type: "string" }, { type: "null" }] },
        page: { anyOf: [{ type: "integer" }, { type: "null" }] },
        role: {
          anyOf: [
            {
              type: "string",
              enum: [
                "method_overview",
                "model_architecture",
                "system_setup",
                "main_result",
                "ablation_result",
                "dataset_overview",
              ],
            },
            { type: "null" },
          ],
        },
        caption: { anyOf: [{ type: "string" }, { type: "null" }] },
        reason: { anyOf: [{ type: "string" }, { type: "null" }] },
      },
      required: [
        "status",
        "figure_id",
        "page",
        "role",
        "caption",
        "reason",
      ],
      additionalProperties: false,
    },
    key_figure_candidates: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          figure_id: { anyOf: [{ type: "string" }, { type: "null" }] },
          page: { anyOf: [{ type: "integer" }, { type: "null" }] },
          role: {
            anyOf: [
              {
                type: "string",
                enum: [
                  "method_overview",
                  "model_architecture",
                  "system_setup",
                  "main_result",
                  "ablation_result",
                  "dataset_overview",
                ],
              },
              { type: "null" },
            ],
          },
          caption: { anyOf: [{ type: "string" }, { type: "null" }] },
          reason: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
        required: ["figure_id", "page", "role", "caption", "reason"],
        additionalProperties: false,
      },
    },
    suggested_domain: { type: "string" },
    suggested_domain_label: { type: "string" },
    domain_suggestion_reason: { type: "string" },
    body: { type: "string" },
  },
  required: [
    "entry_type",
    "primary_domain",
    "domains",
    "publication_type",
    "title",
    "authors",
    "year",
    "venue",
    "doi",
    "abstract",
    "tags",
    "citation_key",
    "key_references",
    "key_figure",
    "key_figure_candidates",
    "suggested_domain",
    "suggested_domain_label",
    "domain_suggestion_reason",
    "body",
  ],
  additionalProperties: false,
};

function buildSystem(fromOriginal: boolean): string {
  return [
    fromOriginal
      ? "You read the original PDF, including figures, equations, and tables, for an audio research group's literature hub."
      : "You process extracted document text for an audio research group's literature hub.",
    "Produce one structured English literature record. entry_type must always be literature.",
    `Allowed research domains: ${DOMAINS.join(", ")}.`,
    "Choose one primary_domain for filing and statistics. Also return domains as all genuinely relevant research domains, including primary_domain. Avoid weak or speculative cross-domain labels.",
    "The approved domains are intentionally broad. Algorithms, model families, applications, and closely related subfields belong in tags, not in new domains.",
    "Only if the paper's central research area cannot reasonably fit any approved domain, set primary_domain to other and propose one broad missing research area in suggested_domain (lowercase kebab-case), suggested_domain_label, and domain_suggestion_reason.",
    "Otherwise return empty strings for all three domain suggestion fields. Never create a near-duplicate or narrower version of an approved domain.",
    `Allowed publication_type values: ${PUBLICATION_TYPES.join(", ")}.`,
    "Classify journal articles, conference papers, preprints, review papers, books, chapters, patents, theses, technical reports, and dataset papers carefully.",
    "Extract the title, authors, and abstract from the document.",
    "For venue (journal/conference/container), DOI, and year: return a value ONLY if it is explicitly printed in the document itself — e.g. a journal/conference line, a DOI string, a copyright or publication-date line. If the document is a preprint or author manuscript with no such publication line, return an empty string for venue and DOI and null for year. NEVER infer, guess, or fabricate a venue, DOI, or year from the topic, the authors' usual venues, the reference list, or similar papers. A missing value is correct and expected; an invented one is a serious error that will be published as fact.",
    "Return every field required by the provided JSON schema.",
    "Tags must be 3-6 specific lowercase kebab-case technical keywords ordered broad to narrow.",
    "Never use years, author names, or generic tags such as audio, paper, research, or signal-processing.",
    "Use a Better-BibTeX-style citation_key: first author surname + year + first significant title word.",
    "Extract only 3-8 key related papers, not the full bibliography. Prioritize references that define the problem, introduce the main method, provide baselines, datasets, surveys, or directly motivate the paper. If uncertain, leave the list empty. Do not hallucinate DOI, title, or year.",
    "For each key related paper return only title, DOI if available, year if available, one role, and one short sentence explaining why it matters.",
    "Optionally recommend one representative Key Figure for human reading. Prefer a method overview, model architecture, system setup, main result, ablation result, or dataset overview that explains the paper at a glance.",
    "For key_figure, return status suggested only when a clearly identified figure and a reliable 1-based PDF page number are available from the original PDF or explicit PDF PAGE markers. Include figure_id, page, role, caption when available, and one short reason. Otherwise return status none with null metadata.",
    "Also return key_figure_candidates: up to 5 figures a human might pick as the cover, ordered best first, each with figure_id (e.g. Fig. 3), the 1-based PDF page, role, a short caption taken from the paper, and one short reason. Make the first candidate match the key_figure suggestion when one exists. Only list figures you can actually identify in the PDF; never invent a figure number, caption, or page. Return an empty array if none are reliable.",
    "Do not extract, crop, upload, or encode an image. The application adds private image storage fields only after human confirmation.",
    "Use exactly this body structure:",
    "## Summary",
    "## Problem",
    "## Method",
    "## Key results",
    "## Strengths",
    "## Limitations",
    "## Relevance to our group",
    "## Notes",
    "Do not add a References, Bibliography, Related work, or Works cited section to body. The key_references field is the only place for related-paper anchors.",
    "In Method, write important equations with standard Markdown math delimiters: $...$ for inline math and $$...$$ for display math.",
    "Never put equations in backticks or code fences. Define every important symbol in nearby prose so the method remains readable without reverse-engineering notation.",
    "Summary is one compact paragraph. Separate source-grounded findings from team-facing interpretation.",
    "Write clear standard academic English. Mark uncertain claims with (TODO: verify) instead of inventing them.",
    "Target 700-1400 words. A human reviews the record before publication.",
  ].join("\n");
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function geminiStructured(parts: GeminiPart[], system: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: LITERATURE_JSON_SCHEMA,
          maxOutputTokens: MAX_TOKENS,
          temperature: 0.2,
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`gemini ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  const data = await response.json();
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
        ? "Gemini output was truncated. Try again."
        : `Gemini stopped early (${finishReason}).`,
    );
  }
  return text;
}

function normalizedTag(value: unknown): string {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shapeLiterature(record: Record<string, unknown>) {
  const primaryDomain = DOMAINS.includes(String(record.primary_domain))
    ? String(record.primary_domain)
    : "other";
  const domains = Array.isArray(record.domains)
    ? [...new Set(record.domains.map(String).filter((domain) => DOMAINS.includes(domain)))]
    : [];
  if (!domains.includes(primaryDomain)) domains.unshift(primaryDomain);
  const publicationType = PUBLICATION_TYPES.includes(String(record.publication_type) as never)
    ? String(record.publication_type)
    : "other";
  const tags = Array.isArray(record.tags)
    ? [...new Set(record.tags.map(normalizedTag))]
        .filter(
          (tag) =>
            tag &&
            !/^\d{4}$/.test(tag) &&
            !["audio", "paper", "research", "signal-processing"].includes(tag),
        )
        .slice(0, 6)
    : [];

  const shaped = {
    entry_type: "literature",
    primary_domain: primaryDomain,
    domains,
    publication_type: publicationType,
    title: String(record.title ?? ""),
    authors: Array.isArray(record.authors) ? record.authors.map(String) : [],
    year: record.year ? Number(record.year) : null,
    venue: String(record.venue ?? ""),
    doi: String(record.doi ?? ""),
    abstract: String(record.abstract ?? ""),
    tags,
    citation_key: String(record.citation_key ?? ""),
    key_references: linkKeyReferences(
      parseKeyReferences(record.key_references),
      getCards(),
    ),
    key_figure: aiKeyFigure(record.key_figure),
    key_figure_candidates: parseKeyFigureCandidates(record.key_figure_candidates),
    suggested_domain: normalizedTag(record.suggested_domain),
    suggested_domain_label: String(record.suggested_domain_label ?? "").trim(),
    domain_suggestion_reason: String(record.domain_suggestion_reason ?? "").trim(),
    body: String(record.body ?? ""),
  };
  if (
    !shaped.suggested_domain ||
    !shaped.suggested_domain_label ||
    !shaped.domain_suggestion_reason ||
    DOMAINS.includes(shaped.suggested_domain) ||
    shaped.primary_domain !== "other"
  ) {
    shaped.suggested_domain = "";
    shaped.suggested_domain_label = "";
    shaped.domain_suggestion_reason = "";
  }
  if (!shaped.title.trim() || !shaped.body.trim()) {
    throw new Error("The model returned an incomplete literature record (missing title or body).");
  }
  return shaped;
}

function crossrefPublicationType(type: string): string {
  switch (type) {
    case "proceedings-article": return "conference-paper";
    case "journal-article": return "journal-paper";
    case "book-chapter": return "book-chapter";
    case "book": return "book";
    case "dissertation": return "thesis";
    case "report": return "technical-report";
    default: return "other";
  }
}

// Overlap coefficient (shared / smaller set): tolerant of one title being the
// other plus a subtitle, while the >=4 distinct-token floor avoids matching on
// short generic titles like "active noise control".
function titleOverlap(left: string, right: string): number {
  const tokens = (value: string) => new Set(value.split(" ").filter((word) => word.length > 2));
  const a = tokens(left);
  const b = tokens(right);
  const smaller = Math.min(a.size, b.size);
  if (smaller < 4) return 0;
  let common = 0;
  for (const word of a) if (b.has(word)) common += 1;
  return common / smaller;
}

interface CrossrefItem {
  title?: string[];
  "container-title"?: string[];
  issued?: { "date-parts"?: number[][] };
  DOI?: string;
  type?: string;
}

// When the document itself carries no venue/DOI/year (preprints, author
// manuscripts), look the paper up on Crossref by title rather than let the model
// guess. Only fills fields that are still missing, and only on a strong title
// match — so we never overwrite what was genuinely printed in the document, and
// never fabricate. If nothing matches, the value stays empty and the required
// fields prompt the submitter to add it.
async function enrichMissingMetadata<
  T extends { title: string; authors: string[]; year: number | null; venue: string; doi: string; publication_type: string },
>(record: T): Promise<T> {
  if (record.year && record.venue.trim() && record.doi.trim()) return record;
  const title = record.title.trim();
  if (title.length < 8) return record;
  try {
    // Bibliographic query alone ranks the right paper well; we then re-rank the
    // returned set by title overlap. (A query.author filter was dropped — it can
    // reweight the result set away from the correct paper.)
    const params = new URLSearchParams({ "query.bibliographic": title, rows: "5" });
    const response = await fetch(`https://api.crossref.org/works?${params.toString()}`, {
      headers: { "User-Agent": "research-literature-hub (mailto:team@example.com)" },
    });
    if (!response.ok) return record;
    const data = await response.json();
    const items: CrossrefItem[] = data.message?.items || [];
    const wanted = normalizedTitle(title);
    let best: CrossrefItem | null = null;
    let bestScore = 0;
    for (const item of items) {
      const score = titleOverlap(wanted, normalizedTitle(item.title?.[0] || ""));
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    if (!best || bestScore < 0.85) return record;
    const matchedYear = best.issued?.["date-parts"]?.[0]?.[0];
    return {
      ...record,
      year: record.year || (typeof matchedYear === "number" ? matchedYear : record.year),
      venue: record.venue.trim() || best["container-title"]?.[0] || "",
      doi: record.doi.trim() || best.DOI || "",
      publication_type:
        record.publication_type === "other" && best.type
          ? crossrefPublicationType(best.type)
          : record.publication_type,
    };
  } catch {
    return record;
  }
}

function invalidRecordResponse(raw: string, error: unknown, provider: string) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn("LLM literature JSON parse failed", {
    provider,
    rawLength: raw.length,
    error: message,
  });
  return NextResponse.json(
    { error: `The model returned an invalid literature record: ${message}` },
    { status: 502 },
  );
}

export async function POST(req: NextRequest) {
  const { text, driveFileId } = (await req.json()) as { text?: string; driveFileId?: string };
  if (isGuest(req.headers.get("x-kb-user"))) {
    return NextResponse.json({
      ...guestLiteratureDraft(text || driveFileId || ""),
      demo: true,
    });
  }

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
          { text: "Produce the literature record now." },
        ],
        buildSystem(true),
      );
    } catch (error) {
      return NextResponse.json(
        { error: `Original-PDF analysis failed: ${error instanceof Error ? error.message : error}` },
        { status: 502 },
      );
    }

    try {
      return NextResponse.json(await enrichMissingMetadata(shapeLiterature(parseJsonLoose(raw))));
    } catch (error) {
      return invalidRecordResponse(raw, error, "gemini-original-pdf");
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
      { error: "No usable text was extracted from the PDF. It may be scanned or image-only." },
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
    return NextResponse.json(await enrichMissingMetadata(shapeLiterature(parseJsonLoose(raw))));
  } catch (error) {
    return invalidRecordResponse(raw, error, llmProvider());
  }
}
