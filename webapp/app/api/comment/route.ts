import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import type { CommentEntry } from "@/lib/types";
import { getCard } from "@/lib/kb";
import { readTeam } from "@/lib/team";

export const runtime = "nodejs";

const GH = "https://api.github.com";
const MAX_COMMENT_LENGTH = 4000;

interface GitHubFile {
  content: string;
  encoding: string;
  sha: string;
  html_url?: string;
}

function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN || "",
    repo: process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO || "",
    ref: process.env.GITHUB_BASE || "main",
  };
}

function validSlug(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value);
}

function timestamp(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value || "");
}

function parseComments(value: unknown): CommentEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const comment = item as Record<string, unknown>;
    const id = String(comment.id || "").trim();
    const author = String(comment.author || "").trim();
    const body = String(comment.body || "").trim();
    if (!id || !author || !body) return [];
    return [{
      id,
      author,
      body,
      created: timestamp(comment.created),
      updated: timestamp(comment.updated || comment.created),
    }];
  });
}

async function getFile(repo: string, slug: string, ref: string, token: string): Promise<GitHubFile> {
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/official/${slug}.md?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (response.status === 404) throw new Error("Card not found in the official library.");
  if (!response.ok) throw new Error(`GitHub read failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  return response.json();
}

async function currentMember(username: string) {
  const { config } = await readTeam();
  return config.members.find((member) => member.id === username && member.active);
}

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const slug = String(req.nextUrl.searchParams.get("slug") || "").trim();
  const { token, repo, ref } = githubConfig();
  if (!username || !validSlug(slug)) {
    return NextResponse.json({ error: "A valid team account and card are required." }, { status: 400 });
  }
  try {
    const member = await currentMember(username);
    if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    if (!token || !repo) {
      const card = getCard(slug);
      if (!card || card.folder !== "official") {
        return NextResponse.json({ error: "Card not found in the official library." }, { status: 404 });
      }
      return NextResponse.json({ comments: card.comments, viewer: member.id });
    }
    const file = await getFile(repo, slug, ref, token);
    const raw = Buffer.from(file.content.replace(/\n/g, ""), file.encoding as BufferEncoding).toString("utf-8");
    const parsed = matter(raw);
    return NextResponse.json({ comments: parseComments(parsed.data.comments), viewer: member.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const body = (await req.json()) as { slug?: string; id?: string; body?: string };
  const slug = String(body.slug || "").trim();
  const commentId = String(body.id || "").trim();
  const text = String(body.body || "").trim();
  const { token, repo, ref } = githubConfig();

  if (!token || !repo) {
    return NextResponse.json({ error: "GitHub write access is not configured." }, { status: 501 });
  }
  if (!username || !validSlug(slug) || text.length < 2 || text.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: `A valid card and a 2-${MAX_COMMENT_LENGTH} character comment are required.` },
      { status: 400 },
    );
  }
  if (commentId && !/^[A-Za-z0-9_-]{4,100}$/.test(commentId)) {
    return NextResponse.json({ error: "Invalid comment ID." }, { status: 400 });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const member = await currentMember(username);
      if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
      const file = await getFile(repo, slug, ref, token);
      const raw = Buffer.from(file.content.replace(/\n/g, ""), file.encoding as BufferEncoding).toString("utf-8");
      const parsed = matter(raw);
      const comments = parseComments(parsed.data.comments);
      const now = new Date().toISOString();
      let action = "comment_added";
      let saved: CommentEntry;

      if (commentId) {
        const index = comments.findIndex((comment) => comment.id === commentId);
        if (index < 0) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
        if (comments[index].author !== member.id) {
          return NextResponse.json({ error: "You can only edit your own comments." }, { status: 403 });
        }
        saved = { ...comments[index], body: text, updated: now };
        comments[index] = saved;
        action = "comment_updated";
      } else {
        saved = {
          id: `${member.id}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
          author: member.id,
          body: text,
          created: now,
          updated: now,
        };
        comments.push(saved);
      }

      if (parsed.data.created instanceof Date) {
        parsed.data.created = parsed.data.created.toISOString().slice(0, 10);
      }
      parsed.data.comments = comments;
      parsed.data.activity = [
        ...(Array.isArray(parsed.data.activity) ? parsed.data.activity : []),
        { action, by: member.id, at: now, detail: saved.id },
      ];
      const updated = matter.stringify(parsed.content.trimStart(), parsed.data);
      const response = await fetch(`${GH}/repos/${repo}/contents/official/${slug}.md`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `comment: ${commentId ? "update" : "add"} ${slug} by ${member.id}`,
          content: Buffer.from(updated, "utf-8").toString("base64"),
          sha: file.sha,
          branch: ref,
        }),
      });
      if (response.status === 409) continue;
      if (!response.ok) {
        throw new Error(`GitHub write failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
      }
      const result = await response.json();
      return NextResponse.json({
        comments,
        saved,
        card_url: result.content?.html_url || file.html_url,
      });
    } catch (error) {
      if (attempt === 2) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : String(error) },
          { status: 502 },
        );
      }
    }
  }
  return NextResponse.json({ error: "The literature record changed while saving. Please retry." }, { status: 409 });
}
