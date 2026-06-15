import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { validateLiteratureContent, stringifyLiteratureContent } from "@/lib/card-content";
import { currentTeamMember } from "@/lib/current-member";
import { isGuest } from "@/lib/guest";
import {
  decodeGitHubFile,
  deleteGitHubFile,
  readGitHubFile,
  writeGitHubFile,
} from "@/lib/github-content";
import { getCard } from "@/lib/kb";

export const runtime = "nodejs";

const SYSTEM_FIELDS = [
  "created",
  "uploaded_by",
  "uploaded_at",
  "pdf_uploaded_by",
  "pdf_uploaded_at",
  "pdf_file_name",
  "pdf_reused",
  "rating",
  "ratings",
  "reviewed_by",
  "comments",
] as const;

function validSlug(slug: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug);
}

async function routeContext(
  req: NextRequest,
  params: Promise<{ slug: string }>,
) {
  const username = req.headers.get("x-kb-user") || "";
  const { slug } = await params;
  if (!username || !validSlug(slug)) return null;
  const member = await currentTeamMember(username);
  return member ? { username, slug, member } : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const context = await routeContext(req, params);
    if (!context) {
      return NextResponse.json({ error: "A valid team account and card are required." }, { status: 403 });
    }
    if (isGuest(context.username)) {
      const card = getCard(context.slug);
      if (!card || card.folder !== "official") {
        return NextResponse.json({ error: "Card not found." }, { status: 404 });
      }
      const local = matter.stringify(card.body.trimStart(), {
        title: card.title,
        entry_type: card.entry_type,
        primary_domain: card.primary_domain,
        domains: card.domains,
        publication_type: card.publication_type,
        venue: card.venue,
        doi: card.doi,
        abstract: card.abstract,
        status: card.status,
        citation_key: card.citation_key,
        authors: card.authors,
        year: card.year,
        tags: card.tags,
        key_references: card.key_references,
        drive: card.drive,
        related: card.related,
        created: card.created,
      });
      return NextResponse.json({ slug: context.slug, content: local, demo: true });
    }
    const file = await readGitHubFile(
      `official/${context.slug}.md`,
      "Card not found in the official library.",
    );
    return NextResponse.json({
      slug: context.slug,
      content: decodeGitHubFile(file),
      sha: file.sha,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: message.includes("not found") ? 404 : 502 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const body = (await req.json()) as { content?: string };
  const content = String(body.content || "");
  if (content.length < 100 || content.length > 200_000) {
    return NextResponse.json(
      { error: "Card content must be between 100 and 200,000 characters." },
      { status: 400 },
    );
  }
  try {
    const context = await routeContext(req, params);
    if (!context) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    if (isGuest(context.username)) {
      validateLiteratureContent(context.slug, content);
      return NextResponse.json({ saved: true, demo: true });
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const file = await readGitHubFile(
        `official/${context.slug}.md`,
        "Card not found in the official library.",
      );
      const current = matter(decodeGitHubFile(file));
      const edited = validateLiteratureContent(context.slug, content);
      for (const field of SYSTEM_FIELDS) {
        edited.data[field] = current.data[field];
      }
      edited.data.status = "official";
      edited.data.last_edited_by = context.member.id;
      edited.data.last_edited_at = new Date().toISOString();
      edited.data.activity = [
        ...(Array.isArray(current.data.activity) ? current.data.activity : []),
        {
          action: "card_edited",
          by: context.member.id,
          at: edited.data.last_edited_at,
        },
      ];
      try {
        const result = await writeGitHubFile({
          path: `official/${context.slug}.md`,
          content: stringifyLiteratureContent(edited),
          sha: file.sha,
          message: `literature: edit ${context.slug} by ${context.member.id}`,
        });
        return NextResponse.json({
          saved: true,
          card_url: result.content?.html_url,
          deploy_pending: true,
        });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("(409)") || attempt === 2) {
          throw error;
        }
      }
    }
    return NextResponse.json(
      { error: "The card changed while saving. Reload and retry." },
      { status: 409 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: message.startsWith("Card is incomplete") ? 400 : 502 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const context = await routeContext(req, params);
    if (!context) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    if (isGuest(context.username)) {
      return NextResponse.json({ deleted: true, demo: true });
    }
    const file = await readGitHubFile(
      `official/${context.slug}.md`,
      "Card not found in the official library.",
    );
    const parsed = matter(decodeGitHubFile(file));
    const creator = String(parsed.data.uploaded_by || "").toUpperCase();
    if (context.member.role !== "admin" && creator !== context.member.id.toUpperCase()) {
      return NextResponse.json(
        { error: "Only the card creator or an administrator can delete it directly." },
        { status: 403 },
      );
    }
    await deleteGitHubFile({
      path: `official/${context.slug}.md`,
      sha: file.sha,
      message: `literature: delete ${context.slug} by ${context.member.id}`,
    });
    return NextResponse.json({
      deleted: true,
      pdf_preserved: true,
      deploy_pending: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: message.includes("not found") ? 404 : 502 },
    );
  }
}
