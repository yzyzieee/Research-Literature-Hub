import { NextRequest, NextResponse } from "next/server";
import { BODY_TEMPLATES } from "@/lib/templates";
import type { CardType } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

// Frugal-by-design: one non-streaming chat completion per explicit button click,
// capped output, no retries. Drafting a card costs roughly 2-3K output tokens.
const MAX_TOKENS = 3000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured — fill the card manually or set the key in .env.local" },
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
    "Write the complete bilingual card body now.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `DeepSeek API error ${res.status}: ${text.slice(0, 300)}` },
      { status: 502 },
    );
  }
  const data = await res.json();
  const body: string = data.choices?.[0]?.message?.content ?? "";
  if (!body.trim()) {
    return NextResponse.json({ error: "DeepSeek returned an empty draft" }, { status: 502 });
  }
  return NextResponse.json({ body, usage: data.usage });
}
