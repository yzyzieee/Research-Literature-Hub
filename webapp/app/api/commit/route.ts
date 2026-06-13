import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GH = "https://api.github.com";

async function gh(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
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
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO;
  const missing = [
    !token ? "GITHUB_TOKEN" : "",
    !repo ? "GITHUB_REPO (or NEXT_PUBLIC_GITHUB_REPO)" : "",
  ].filter(Boolean);

  if (missing.length) {
    return NextResponse.json(
      {
        error: `Server configuration missing: ${missing.join(
          ", ",
        )}. Add it to the Vercel Production environment and redeploy.`,
      },
      { status: 501 },
    );
  }
  const githubToken = token as string;
  const repository = repo as string;

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
    const baseRef = await gh(`/repos/${repository}/git/ref/heads/${base}`, githubToken);
    await gh(`/repos/${repository}/git/refs`, githubToken, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseRef.object.sha }),
    });
    await gh(`/repos/${repository}/contents/pending/${slug}.md`, githubToken, {
      method: "PUT",
      body: JSON.stringify({
        message: `draft: add card ${slug}`,
        content: Buffer.from(content, "utf-8").toString("base64"),
        branch,
      }),
    });
    const pr = await gh(`/repos/${repository}/pulls`, githubToken, {
      method: "POST",
      body: JSON.stringify({
        title: `Card: ${slug}`,
        head: branch,
        base,
        body: [
          `New draft card \`pending/${slug}.md\`${author ? ` by ${author}` : ""}.`,
          "",
          "Review checklist:",
          "- [ ] Domain, type, tags, citation key, and source type are correct",
          "- [ ] Equations, claims, figures, and references have been verified",
          "- [ ] The card adds reusable knowledge and useful cross-links",
          "- [ ] Reviewer sets `status: official` before approving",
        ].join("\n"),
      }),
    });
    return NextResponse.json({ pr_url: pr.html_url, branch });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
