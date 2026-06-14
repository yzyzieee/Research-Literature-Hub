import type { TeamConfig, TeamMember } from "./types";

const GH = "https://api.github.com";
export const TEAM_FILE = "team/members.json";

export const DEFAULT_TEAM: TeamConfig = {
  version: 1,
  members: [
    { id: "YZY", name: "YZY", role: "admin", domains: [], active: true, created: "2026-06-14" },
    { id: "JJW", name: "JJW", role: "member", domains: [], active: true, created: "2026-06-14" },
    { id: "WBX", name: "WBX", role: "member", domains: [], active: true, created: "2026-06-14" },
  ],
};

interface GitHubTeamFile {
  sha: string;
  content: string;
  encoding: string;
}

function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN || "",
    repo: process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO || "",
    ref: process.env.GITHUB_BASE || "main",
  };
}

function normalized(config: TeamConfig): TeamConfig {
  return {
    version: 1,
    members: (config.members || [])
      .filter((member) => member && /^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(String(member.id || "")))
      .map((member) => ({
        id: String(member.id).toUpperCase(),
        name: String(member.name || member.id).trim().slice(0, 60),
        role: member.role === "admin" ? "admin" : "member",
        domains: Array.isArray(member.domains) ? member.domains.map(String) : [],
        active: member.active !== false,
        created: String(member.created || ""),
      })),
  };
}

export async function readTeam(): Promise<{ config: TeamConfig; sha?: string }> {
  const { token, repo, ref } = githubConfig();
  if (!token || !repo) return { config: normalized(DEFAULT_TEAM) };
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/${TEAM_FILE}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (response.status === 404) return { config: normalized(DEFAULT_TEAM) };
  if (!response.ok) {
    throw new Error(`Team registry read failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  }
  const file = (await response.json()) as GitHubTeamFile;
  const raw = Buffer.from(file.content.replace(/\n/g, ""), file.encoding as BufferEncoding).toString("utf-8");
  return { config: normalized(JSON.parse(raw) as TeamConfig), sha: file.sha };
}

export async function writeTeam(config: TeamConfig, sha?: string): Promise<void> {
  const { token, repo, ref } = githubConfig();
  if (!token || !repo) throw new Error("GitHub write access is not configured.");
  const response = await fetch(`${GH}/repos/${repo}/contents/${TEAM_FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "team: update member registry",
      content: Buffer.from(JSON.stringify(normalized(config), null, 2) + "\n", "utf-8").toString("base64"),
      ...(sha ? { sha } : {}),
      branch: ref,
    }),
  });
  if (!response.ok) {
    throw new Error(`Team registry write failed (${response.status}): ${(await response.text()).slice(0, 200)}`);
  }
}

export function activeMembers(config: TeamConfig): TeamMember[] {
  return config.members.filter((member) => member.active);
}
