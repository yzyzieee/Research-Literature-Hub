import matter from "gray-matter";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CARDS_TAG, getCardsRemote } from "@/lib/kb-remote";
import { findDuplicateCandidates } from "@/lib/duplicates";
import { isGuest } from "@/lib/guest";
import { githubServerConfig } from "@/lib/github-config";
import { readTeam } from "@/lib/team";
import { stringifyLiteratureContent, validateLiteratureContent } from "@/lib/card-content";

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

function validatedOfficialCard(
  slug: string,
  content: string,
  username: string,
  archive?: { name?: string; uploadedBy?: string; uploadedAt?: string; reused?: boolean } | null,
): string {
  const parsed = validateLiteratureContent(slug, content);
  const data = parsed.data as Record<string, unknown>;
  data.status = "official";
  data.reviewed_by = Array.isArray(data.reviewed_by) ? data.reviewed_by : [];
  data.rating = data.rating || null;
  data.ratings = Array.isArray(data.ratings) ? data.ratings : [];
  data.comments = Array.isArray(data.comments) ? data.comments : [];
  const publishedAt = new Date().toISOString();
  data.uploaded_by = username;
  data.uploaded_at = publishedAt;
  if (archive?.name) {
    data.pdf_uploaded_by = archive.reused ? archive.uploadedBy || "unknown" : username;
    data.pdf_uploaded_at = archive.uploadedAt || publishedAt;
    data.pdf_file_name = String(archive.name);
    data.pdf_reused = Boolean(archive.reused);
  }
  data.activity = [
    ...(archive?.name
      ? [{
          action: archive.reused ? "pdf_reused" : "pdf_uploaded",
          by: archive.reused ? archive.uploadedBy || username : username,
          at: archive.uploadedAt || publishedAt,
          detail: String(archive.name),
        }]
      : []),
    { action: "card_published", by: username, at: publishedAt },
  ];
  return stringifyLiteratureContent(parsed);
}

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const { slug, content, archive, allowDuplicate } = (await req.json()) as {
    slug?: string;
    content?: string;
    allowDuplicate?: boolean;
    archive?: { name?: string; uploadedBy?: string; uploadedAt?: string; reused?: boolean } | null;
  };
  if (!slug || !content || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug)) {
    return NextResponse.json({ error: "A valid slug and card content are required." }, { status: 400 });
  }
  if (isGuest(username)) {
    try {
      validatedOfficialCard(slug, content, username, archive);
      return NextResponse.json({
        card_url: "/cards",
        commit_sha: null,
        demo: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: message },
        { status: message.startsWith("Card is incomplete") ? 400 : 502 },
      );
    }
  }

  const { token, repo, ref: base } = githubServerConfig();
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

  try {
    const { config } = await readTeam();
    if (!config.members.some((member) => member.id === username && member.active)) {
      return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    }
    for (const path of [`official/${slug}.md`, `pending/${slug}.md`]) {
      if (await fileExists(repo!, path, base, token!)) {
        return NextResponse.json(
          { error: `A card for "${slug}" already exists at ${path}. Open and update that card instead.` },
          { status: 409 },
        );
      }
    }
    const parsed = matter(content);
    if (!allowDuplicate) {
      // Same matcher as the pre-submit /api/duplicates check, over fresh live
      // cards, so a paper a teammate just published is still caught here.
      const [duplicate] = findDuplicateCandidates(await getCardsRemote({ fresh: true }), {
        title: String(parsed.data.title || ""),
        doi: String(parsed.data.doi || ""),
        citation_key: slug,
        authors: Array.isArray(parsed.data.authors) ? parsed.data.authors.map(String) : [],
        year: parsed.data.year ? Number(parsed.data.year) : null,
      });
      if (duplicate) {
        return NextResponse.json(
          {
            error: `This literature appears to already exist as "${duplicate.slug}". Review the duplicate candidate before publishing.`,
            duplicate: duplicate.slug,
          },
          { status: 409 },
        );
      }
    }

    const officialContent = validatedOfficialCard(slug, content, username, archive);
    const result = await github(`/repos/${repo}/contents/official/${slug}.md`, token!, {
      method: "PUT",
      body: JSON.stringify({
        message: `literature: add ${slug} to official library`,
        content: Buffer.from(officialContent, "utf-8").toString("base64"),
        branch: base,
      }),
    });
    revalidateTag(CARDS_TAG);
    return NextResponse.json({
      card_url: result.content?.html_url || `https://github.com/${repo}/blob/${base}/official/${slug}.md`,
      commit_sha: result.commit?.sha,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: message.startsWith("Card is incomplete") ? 400 : 502 });
  }
}
