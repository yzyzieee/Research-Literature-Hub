import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BODY_TEMPLATES } from "@/lib/templates";
import type { CardType } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured — fill the card manually or set the key in .env" },
      { status: 501 },
    );
  }
  const { type, title, title_zh, authors, year, citation_key, notes } = (await req.json()) as {
    type: CardType;
    title: string;
    title_zh?: string;
    authors?: string[];
    year?: number | null;
    citation_key?: string;
    notes?: string;
  };
  if (!type || !title || !BODY_TEMPLATES[type]) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [
      "You draft bilingual (English + Simplified Chinese) research knowledge cards for an audio / active-noise-control / signal-processing research group.",
      "Output ONLY the markdown card body — no YAML frontmatter, no code fence around the whole output, no preamble.",
      "Follow the section structure of the given template exactly. Within each section write the English content first, then the Chinese content, mirroring each other.",
      "Be technically precise and conservative: if you are unsure of a specific number or claim, mark it with (TODO: verify 待核实) instead of inventing it.",
      "This draft will be human-reviewed before entering the official library; flag uncertain points clearly.",
    ].join("\n"),
    messages: [
      {
        role: "user",
        content: [
          `Card type: ${type}`,
          `Title (en): ${title}`,
          title_zh ? `Title (zh): ${title_zh}` : "",
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
          .join("\n"),
      },
    ],
  });

  try {
    const message = await stream.finalMessage();
    const body = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return NextResponse.json({ body });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Claude API error ${error.status}: ${error.message}` }, { status: 502 });
    }
    throw error;
  }
}
