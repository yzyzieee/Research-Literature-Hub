import { NextRequest, NextResponse } from "next/server";
import { guestLiteratureDraft, isGuest } from "@/lib/guest";
import { LITERATURE_BODY_TEMPLATE } from "@/lib/templates";
import { llmChat, llmConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_TOKENS = 3500;

export async function POST(req: NextRequest) {
  const { title, authors, year, venue, doi, notes } = (await req.json()) as {
    title: string;
    authors?: string[];
    year?: number | null;
    venue?: string;
    doi?: string;
    notes?: string;
  };
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (isGuest(req.headers.get("x-kb-user"))) {
    return NextResponse.json({
      body: guestLiteratureDraft([title, notes].filter(Boolean).join("\n")).body,
      demo: true,
    });
  }
  if (!llmConfigured()) {
    return NextResponse.json(
      { error: "No LLM API key configured. Fill the literature record manually or configure a provider." },
      { status: 501 },
    );
  }

  const system = [
    "You draft English literature records for an audio research group.",
    "Output only the Markdown body: no YAML frontmatter, outer code fence, or preamble.",
    "Follow the supplied section structure exactly.",
    "Separate source-grounded findings from team-facing interpretation.",
    "Be technically conservative. Mark uncertain numbers or claims with (TODO: verify).",
    "This is a compact paper record, not a full literature survey.",
    "Do not add a References, Bibliography, Related work, or Works cited section. Related-paper anchors belong only in key_references metadata.",
    "Write equations with $...$ or $$...$$ delimiters, never as inline code or fenced code.",
    "Explain every important symbol and equation in nearby prose.",
  ].join("\n");

  const user = [
    `Title: ${title}`,
    authors?.length ? `Authors: ${authors.join(", ")}` : "",
    year ? `Year: ${year}` : "",
    venue ? `Venue: ${venue}` : "",
    doi ? `DOI: ${doi}` : "",
    notes ? `Team focus points:\n${notes}` : "",
    "",
    "Template to follow:",
    "```markdown",
    LITERATURE_BODY_TEMPLATE,
    "```",
    "",
    "Write the complete literature record body now.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const body = await llmChat({ system, user, maxTokens: MAX_TOKENS });
    if (!body.trim()) {
      return NextResponse.json({ error: "The model returned an empty draft." }, { status: 502 });
    }
    return NextResponse.json({ body });
  } catch (error) {
    return NextResponse.json(
      { error: `LLM error: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }
}
