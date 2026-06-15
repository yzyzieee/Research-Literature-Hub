import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { stringifyLiteratureContent, validateLiteratureContent } from "@/lib/card-content";
import { currentTeamMember } from "@/lib/current-member";
import { isGuest } from "@/lib/guest";
import { decodeGitHubFile, readGitHubFile } from "@/lib/github-content";

export const runtime = "nodejs";

// Fields the AI re-derives from the PDF. Everything else on the card
// (citation_key, drive, key_figure, status, ratings, comments, created, ...)
// is preserved as-is.
const AI_FIELDS = [
  "title",
  "authors",
  "year",
  "venue",
  "doi",
  "abstract",
  "primary_domain",
  "domains",
  "publication_type",
  "tags",
  "key_references",
] as const;

function validSlug(slug: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const username = req.headers.get("x-kb-user") || "";
  const { slug } = await params;
  if (!username || !validSlug(slug)) {
    return NextResponse.json({ error: "A valid team account and card are required." }, { status: 403 });
  }
  const member = await currentTeamMember(username);
  if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
  if (isGuest(username)) {
    return NextResponse.json({ error: "Re-archiving is disabled in guest demo mode." }, { status: 403 });
  }

  const { record } = (await req.json()) as { record?: Record<string, unknown> };
  if (!record || !String(record.title || "").trim() || !String(record.body || "").trim()) {
    return NextResponse.json({ error: "A complete extracted record is required." }, { status: 400 });
  }

  try {
    const file = await readGitHubFile(
      `official/${slug}.md`,
      "Card not found in the official library.",
    );
    const current = matter(decodeGitHubFile(file));
    const data = current.data as Record<string, unknown>;

    // Overlay only the AI-derived fields; keep citation_key tied to the slug.
    for (const field of AI_FIELDS) {
      if (record[field] !== undefined) data[field] = record[field];
    }
    data.citation_key = slug;

    const content = stringifyLiteratureContent({ ...current, content: String(record.body) });
    // Surfaces "Card is incomplete: ..." if the merge produced an invalid card.
    validateLiteratureContent(slug, content);

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      {
        status: message.includes("not found")
          ? 404
          : message.startsWith("Card is incomplete")
            ? 400
            : 502,
      },
    );
  }
}
