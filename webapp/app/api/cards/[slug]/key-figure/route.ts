import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { currentTeamMember } from "@/lib/current-member";
import { decodeGitHubFile, readGitHubFile, writeGitHubFile } from "@/lib/github-content";
import { isGuest } from "@/lib/guest";
import { parseKeyFigure } from "@/lib/key-figure";
import { getCard } from "@/lib/kb";

export const runtime = "nodejs";

function validSlug(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const username = req.headers.get("x-kb-user") || "";
  const { slug } = await params;
  const body = (await req.json()) as { key_figure?: unknown };
  if (!username || !validSlug(slug)) {
    return NextResponse.json({ error: "A valid team account and card are required." }, { status: 400 });
  }
  const keyFigure = parseKeyFigure(body.key_figure);
  if (keyFigure.status === "cached" && !/^[A-Za-z0-9_-]{8,}$/.test(keyFigure.image_ref || "")) {
    return NextResponse.json({ error: "A cached Key Figure needs a valid private Drive file ID." }, { status: 400 });
  }

  try {
    const member = await currentTeamMember(username);
    if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    if (isGuest(username)) {
      const card = getCard(slug);
      if (!card || card.folder !== "official") {
        return NextResponse.json({ error: "Card not found." }, { status: 404 });
      }
      return NextResponse.json({ saved: true, key_figure: keyFigure, demo: true });
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const file = await readGitHubFile(
        `official/${slug}.md`,
        "Card not found in the official library.",
      );
      const parsed = matter(decodeGitHubFile(file));
      const now = new Date().toISOString();
      if (parsed.data.created instanceof Date) {
        parsed.data.created = parsed.data.created.toISOString().slice(0, 10);
      }
      parsed.data.key_figure = keyFigure;
      parsed.data.activity = [
        ...(Array.isArray(parsed.data.activity) ? parsed.data.activity : []),
        {
          action: keyFigure.status === "none" ? "key_figure_removed" : "key_figure_updated",
          by: member.id,
          at: now,
          detail: keyFigure.figure_id || keyFigure.role || undefined,
        },
      ];
      try {
        await writeGitHubFile({
          path: `official/${slug}.md`,
          content: matter.stringify(parsed.content.trimStart(), parsed.data),
          sha: file.sha,
          message: `literature: update key figure for ${slug} by ${member.id}`,
        });
        return NextResponse.json({
          saved: true,
          key_figure: keyFigure,
          deploy_pending: true,
        });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("(409)") || attempt === 2) {
          throw error;
        }
      }
    }
    return NextResponse.json({ error: "The card changed while saving. Retry." }, { status: 409 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
