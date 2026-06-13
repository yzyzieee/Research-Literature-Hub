import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { DOMAINS, SOURCE_TYPES, TYPE_LABELS } from "@/lib/types";

export const runtime = "nodejs";

const GH = "https://api.github.com";

async function github(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`GitHub ${init?.method ?? "GET"} ${path} -> ${response.status}: ${text.slice(0, 300)}`);
  }
  return data;
}

async function fileExists(repo: string, path: string, ref: string, token: string): Promise<boolean> {
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`GitHub duplicate check -> ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  return true;
}

function validatedOfficialCard(slug: string, content: string): string {
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;
  const type = String(data.type || "");
  const domain = String(data.domain || "");
  const sourceType = String(data.source_type || "");
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const errors: string[] = [];

  if (!String(data.title || "").trim()) errors.push("title");
  if (!Object.prototype.hasOwnProperty.call(TYPE_LABELS, type)) errors.push("valid card type");
  if (!DOMAINS.includes(domain)) errors.push("valid domain");
  if (sourceType && !SOURCE_TYPES.includes(sourceType as (typeof SOURCE_TYPES)[number])) {
    errors.push("valid source type");
  }
  if (!tags.length) errors.push("at least one keyword tag");
  if (!parsed.content.includes("## Summary")) errors.push("Summary section");
  if (!parsed.content.includes("## Key points")) errors.push("Key points section");
  if (type === "paper") {
    if (String(data.citation_key || "") !== slug) errors.push("citation key matching the file name");
    if (!Array.isArray(data.authors) || !data.authors.length) errors.push("authors");
    if (!Number(data.year)) errors.push("year");
  }
  if (errors.length) throw new Error(`Card is incomplete: ${errors.join(", ")}.`);

  if (data.created instanceof Date) data.created = data.created.toISOString().slice(0, 10);
  data.status = "official";
  data.reviewed_by = Array.isArray(data.reviewed_by) ? data.reviewed_by : [];
  data.rating = data.rating || null;
  data.ratings = Array.isArray(data.ratings) ? data.ratings : [];
  return matter.stringify(parsed.content.trimStart(), data);
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO;
  const missing = [
    !token ? "GITHUB_TOKEN" : "",
    !repo ? "GITHUB_REPO (or NEXT_PUBLIC_GITHUB_REPO)" : "",
  ].filter(Boolean);

  if (missing.length) {
    return NextResponse.json(
      { error: `Server configuration missing: ${missing.join(", ")}. Add it to Vercel Production and redeploy.` },
      { status: 501 },
    );
  }

  const { slug, content } = (await req.json()) as { slug?: string; content?: string };
  if (!slug || !content || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return NextResponse.json({ error: "A valid slug and card content are required." }, { status: 400 });
  }

  const base = process.env.GITHUB_BASE || "main";
  try {
    for (const path of [`official/${slug}.md`, `pending/${slug}.md`]) {
      if (await fileExists(repo!, path, base, token!)) {
        return NextResponse.json(
          { error: `A card for "${slug}" already exists at ${path}. Open and update that card instead.` },
          { status: 409 },
        );
      }
    }

    const officialContent = validatedOfficialCard(slug, content);
    const result = await github(`/repos/${repo}/contents/official/${slug}.md`, token!, {
      method: "PUT",
      body: JSON.stringify({
        message: `card: add ${slug} to official library`,
        content: Buffer.from(officialContent, "utf-8").toString("base64"),
        branch: base,
      }),
    });
    return NextResponse.json({
      card_url: result.content?.html_url || `https://github.com/${repo}/blob/${base}/official/${slug}.md`,
      commit_sha: result.commit?.sha,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: message.startsWith("Card is incomplete") ? 400 : 502 });
  }
}
