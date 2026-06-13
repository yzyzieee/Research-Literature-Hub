import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GH = "https://api.github.com";

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${init?.method ?? "GET"} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  const repo = process.env.GITHUB_REPO;
  if (!process.env.GITHUB_TOKEN || !repo) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN / GITHUB_REPO not configured — download the card and commit it manually" },
      { status: 501 },
    );
  }
  const { slug, content, author } = (await req.json()) as {
    slug: string;
    content: string;
    author?: string;
  };
  if (!slug || !content || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return NextResponse.json({ error: "valid slug and content are required" }, { status: 400 });
  }

  const base = process.env.GITHUB_BASE || "main";
  const branch = `card/${slug}-${Date.now().toString(36)}`;

  try {
    const baseRef = await gh(`/repos/${repo}/git/ref/heads/${base}`);
    await gh(`/repos/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseRef.object.sha }),
    });
    await gh(`/repos/${repo}/contents/pending/${slug}.md`, {
      method: "PUT",
      body: JSON.stringify({
        message: `draft: add card ${slug}`,
        content: Buffer.from(content, "utf-8").toString("base64"),
        branch,
      }),
    });
    const pr = await gh(`/repos/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Card: ${slug}`,
        head: branch,
        base,
        body: [
          `New draft card \`pending/${slug}.md\`${author ? ` by ${author}` : ""}.`,
          "",
          "Review checklist 审核清单:",
          "- [ ] Metadata complete (bilingual titles, type, tags, citation key) 元数据完整",
          "- [ ] Content verified (equations, claims, references) 内容已核对",
          "- [ ] Knowledge value & cross-links 知识价值与互链",
          "- [ ] Reviewer set `status: official` before approving 审核人已将 status 改为 official",
        ].join("\n"),
      }),
    });
    return NextResponse.json({ pr_url: pr.html_url, branch });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
