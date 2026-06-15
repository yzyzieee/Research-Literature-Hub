import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { DOMAINS, PUBLICATION_TYPES } from "@/lib/types";
import { isGuest } from "@/lib/guest";
import { githubServerConfig } from "@/lib/github-config";
import { readTeam } from "@/lib/team";

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

function normalizedDoi(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

function normalizedTitle(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function findMetadataDuplicate(
  repo: string,
  ref: string,
  token: string,
  title: string,
  doi: string,
): Promise<string | null> {
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/index/cards.json?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub duplicate metadata check -> ${response.status}`);
  }
  const file = await response.json();
  const raw = Buffer.from(String(file.content || "").replace(/\n/g, ""), "base64").toString("utf-8");
  const records = JSON.parse(raw) as Array<{ slug?: string; title?: string; doi?: string; entry_type?: string }>;
  const wantedDoi = normalizedDoi(doi);
  const wantedTitle = normalizedTitle(title);
  const duplicate = records.find((record) => {
    if (record.entry_type && record.entry_type !== "literature") return false;
    const recordDoi = normalizedDoi(record.doi);
    if (wantedDoi && recordDoi && wantedDoi === recordDoi) return true;
    return wantedTitle.length > 12 && normalizedTitle(record.title) === wantedTitle;
  });
  return duplicate?.slug || null;
}

function validatedOfficialCard(
  slug: string,
  content: string,
  username: string,
  archive?: { name?: string; uploadedBy?: string; uploadedAt?: string; reused?: boolean } | null,
): string {
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;
  const entryType = String(data.entry_type || "");
  const primaryDomain = String(data.primary_domain || "");
  const domains = Array.isArray(data.domains) ? data.domains.map(String) : [];
  const publicationType = String(data.publication_type || "");
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const errors: string[] = [];

  if (!String(data.title || "").trim()) errors.push("title");
  if (entryType !== "literature") errors.push("entry_type: literature");
  if (!DOMAINS.includes(primaryDomain)) errors.push("valid primary domain");
  if (
    !domains.length ||
    !domains.includes(primaryDomain) ||
    domains.some((domain) => !DOMAINS.includes(domain))
  ) {
    errors.push("valid domains including the primary domain");
  }
  if (!PUBLICATION_TYPES.includes(publicationType as (typeof PUBLICATION_TYPES)[number])) {
    errors.push("valid publication type");
  }
  if (tags.length < 1 || tags.length > 6) errors.push("1-6 keyword tags");
  for (const section of [
    "## Summary",
    "## Problem",
    "## Method",
    "## Key results",
    "## Strengths",
    "## Limitations",
    "## Relevance to our group",
    "## Notes",
    "## References",
  ]) {
    if (!parsed.content.includes(section)) errors.push(`${section.slice(3)} section`);
  }
  if (String(data.citation_key || "") !== slug) errors.push("citation key matching the file name");
  if (!Array.isArray(data.authors) || !data.authors.length) errors.push("authors");
  if (!Number(data.year)) errors.push("year");
  if (errors.length) throw new Error(`Card is incomplete: ${errors.join(", ")}.`);

  if (data.created instanceof Date) data.created = data.created.toISOString().slice(0, 10);
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
  return matter.stringify(parsed.content.trimStart(), data);
}

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const { slug, content, archive } = (await req.json()) as {
    slug?: string;
    content?: string;
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
    const duplicate = await findMetadataDuplicate(
      repo!,
      base,
      token!,
      String(parsed.data.title || ""),
      String(parsed.data.doi || ""),
    );
    if (duplicate) {
      return NextResponse.json(
        { error: `This literature appears to already exist as "${duplicate}". Open that record instead.` },
        { status: 409 },
      );
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
    return NextResponse.json({
      card_url: result.content?.html_url || `https://github.com/${repo}/blob/${base}/official/${slug}.md`,
      commit_sha: result.commit?.sha,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: message.startsWith("Card is incomplete") ? 400 : 502 });
  }
}
