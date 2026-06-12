import { NextRequest, NextResponse } from "next/server";
import { BODY_TEMPLATES } from "@/lib/templates";
import type { CardType } from "@/lib/types";
import { llmChat, llmConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 120;

// Frugal-by-design: one non-streaming chat completion per explicit button click,
// capped output, no retries. Drafting a card costs roughly 2-3K output tokens.
const MAX_TOKENS = 3000;

export async function POST(req: NextRequest) {
  if (!llmConfigured()) {
    return NextResponse.json(
      { error: "No LLM API key configured — fill the card manually or set a key (e.g. DEEPSEEK_API_KEY)." },
      { status: 501 },
    );
  }
  const { type, title, authors, year, citation_key, notes } = (await req.json()) as {
    type: CardType;
    title: string;
    authors?: string[];
    year?: number | null;
    citation_key?: string;
    notes?: string;
  };
  if (!type || !title || !BODY_TEMPLATES[type]) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const system = [
    "You draft English research knowledge cards for an audio / active-noise-control / signal-processing research group.",
    "Output ONLY the markdown card body — no YAML frontmatter, no code fence around the whole output, no preamble.",
    "Follow the section structure of the given template exactly. Write in clear, standard academic English only.",
    "Be technically precise and conservative: if you are unsure of a specific number or claim, mark it with (TODO: verify) instead of inventing it.",
    "Keep it compact — this is a knowledge card, not a survey. The draft will be human-reviewed before entering the official library.",
  ].join("\n");

  const user = [
    `Card type: ${type}`,
    `Title: ${title}`,
    authors?.length ? `Authors: ${authors.join(", ")}` : "",
    year ? `Year: ${year}` : "",
    citation_key ? `Citation key: ${citation_key}` : "",
    notes ? `Author's notes / focus points:\n${notes}` : "",
    "",
    "Template to follow:",
    "```markdown",
    BODY_TEMPLATES[type],
    "```",
    "",
    "Write the complete card body now.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const body = await llmChat({ system, user, maxTokens: MAX_TOKENS });
    if (!body.trim()) {
      return NextResponse.json({ error: "The model returned an empty draft" }, { status: 502 });
    }
    return NextResponse.json({ body });
  } catch (e) {
    return NextResponse.json({ error: `LLM error: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }
}
