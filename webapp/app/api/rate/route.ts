import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import type { RatingAggregate, RatingEntry } from "@/lib/types";
import { readTeam } from "@/lib/team";

export const runtime = "nodejs";

const GH = "https://api.github.com";

interface GitHubFile {
  content: string;
  encoding: string;
  sha: string;
  html_url?: string;
}

function valueInRange(value: unknown): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

function aggregate(ratings: RatingEntry[]): RatingAggregate {
  const average = (key: "recommendation" | "innovation" | "rigor") =>
    rounded(ratings.reduce((sum, rating) => sum + rating[key], 0) / ratings.length);
  const recommendation = average("recommendation");
  const innovation = average("innovation");
  const rigor = average("rigor");
  return {
    recommendation,
    innovation,
    rigor,
    weight: Math.round(((recommendation + innovation + rigor) / 15) * 100),
    count: ratings.length,
  };
}

async function getFile(repo: string, path: string, ref: string, token: string): Promise<GitHubFile> {
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}?${params}`, {
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

async function putFile(
  repo: string,
  path: string,
  ref: string,
  sha: string,
  content: string,
  reviewer: string,
  token: string,
) {
  return fetch(`${GH}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `rating: update ${path.split("/").pop()?.replace(/\.md$/, "")} by ${reviewer}`,
      content: Buffer.from(content, "utf-8").toString("base64"),
      sha,
      branch: ref,
    }),
  });
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO;
  if (!token || !repo) {
    return NextResponse.json({ error: "GitHub write access is not configured." }, { status: 501 });
  }

  const body = (await req.json()) as {
    slug?: string;
    recommendation?: number;
    innovation?: number;
    rigor?: number;
  };
  const slug = String(body.slug || "").trim();
  const reviewer = req.headers.get("x-kb-user") || "";
  const recommendation = valueInRange(body.recommendation);
  const innovation = valueInRange(body.innovation);
  const rigor = valueInRange(body.rigor);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug) || !reviewer || !recommendation || !innovation || !rigor) {
    return NextResponse.json(
      { error: "A valid card and three integer scores from 1 to 5 are required." },
      { status: 400 },
    );
  }

  const ref = process.env.GITHUB_BASE || "main";
  const path = `official/${slug}.md`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { config } = await readTeam();
      const member = config.members.find((item) => item.id === reviewer && item.active);
      if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
      const file = await getFile(repo, path, ref, token);
      const raw = Buffer.from(file.content.replace(/\n/g, ""), file.encoding as BufferEncoding).toString("utf-8");
      const parsed = matter(raw);
      const existing = Array.isArray(parsed.data.ratings) ? parsed.data.ratings : [];
      const previous = existing.find(
        (item) =>
          item &&
          typeof item === "object" &&
          String(item.reviewer || "").toLocaleLowerCase() === reviewer.toLocaleLowerCase(),
      );
      const ratings: RatingEntry[] = existing
        .filter((item): item is RatingEntry => Boolean(item && typeof item === "object" && item.reviewer))
        .map((item) => ({
          reviewer: String(item.reviewer),
          recommendation: Number(item.recommendation),
          innovation: Number(item.innovation),
          rigor: Number(item.rigor),
          updated: String(item.updated || ""),
        }))
        .filter((item) => item.reviewer.toLocaleLowerCase() !== reviewer.toLocaleLowerCase());
      ratings.push({
        reviewer: member.id,
        recommendation,
        innovation,
        rigor,
        updated: new Date().toISOString().slice(0, 10),
      });
      ratings.sort((a, b) => a.reviewer.localeCompare(b.reviewer));
      const rating = aggregate(ratings);

      if (parsed.data.created instanceof Date) {
        parsed.data.created = parsed.data.created.toISOString().slice(0, 10);
      }
      parsed.data.rating = rating;
      parsed.data.ratings = ratings;
      parsed.data.reviewed_by = ratings.map((item) => item.reviewer);
      parsed.data.activity = [
        ...(Array.isArray(parsed.data.activity) ? parsed.data.activity : []),
        {
          action: previous ? "rating_updated" : "rating_added",
          by: member.id,
          at: new Date().toISOString(),
          detail: `recommendation=${recommendation}, innovation=${innovation}, rigor=${rigor}`,
        },
      ];
      const updated = matter.stringify(parsed.content.trimStart(), parsed.data);
      const response = await putFile(repo, path, ref, file.sha, updated, reviewer, token);
      if (response.status === 409) continue;
      if (!response.ok) {
        throw new Error(`GitHub write failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
      }
      const result = await response.json();
      return NextResponse.json({
        rating,
        ratings,
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
