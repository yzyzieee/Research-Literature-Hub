import { githubServerConfig } from "./github-config";

const GH = "https://api.github.com";

export interface GitHubContentFile {
  content: string;
  encoding: string;
  sha: string;
  html_url?: string;
}

interface GitHubContentEntry {
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

function headers(token: string, hasBody = false): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
  };
}

export function decodeGitHubFile(file: GitHubContentFile): string {
  return Buffer.from(
    file.content.replace(/\n/g, ""),
    file.encoding as BufferEncoding,
  ).toString("utf-8");
}

export async function readGitHubFile(
  path: string,
  missingMessage = "File not found.",
): Promise<GitHubContentFile> {
  const { token, repo, ref } = githubServerConfig();
  if (!token || !repo) throw new Error("GitHub write access is not configured.");
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}?${params}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (response.status === 404) throw new Error(missingMessage);
  if (!response.ok) {
    throw new Error(
      `GitHub read failed (${response.status}): ${(await response.text()).slice(0, 240)}`,
    );
  }
  return response.json();
}

export async function listGitHubDirectoryPaths(path: string): Promise<string[]> {
  const { token, repo, ref } = githubServerConfig();
  if (!token || !repo) throw new Error("GitHub read access is not configured.");
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}?${params}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(
      `GitHub directory read failed (${response.status}): ${(await response.text()).slice(0, 240)}`,
    );
  }
  const entries = (await response.json()) as GitHubContentEntry[];
  if (!Array.isArray(entries)) return [];
  return entries.filter((entry) => entry.type === "file").map((entry) => entry.path);
}

export async function writeGitHubFile({
  path,
  content,
  message,
  sha,
}: {
  path: string;
  content: string;
  message: string;
  sha?: string;
}) {
  const { token, repo, ref } = githubServerConfig();
  if (!token || !repo) throw new Error("GitHub write access is not configured.");
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: headers(token, true),
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      ...(sha ? { sha } : {}),
      branch: ref,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `GitHub write failed (${response.status}): ${(await response.text()).slice(0, 240)}`,
    );
  }
  return response.json();
}

export async function deleteGitHubFile({
  path,
  sha,
  message,
}: {
  path: string;
  sha: string;
  message: string;
}) {
  const { token, repo, ref } = githubServerConfig();
  if (!token || !repo) throw new Error("GitHub write access is not configured.");
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}`, {
    method: "DELETE",
    headers: headers(token, true),
    body: JSON.stringify({ message, sha, branch: ref }),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(
      `GitHub delete failed (${response.status}): ${(await response.text()).slice(0, 240)}`,
    );
  }
  return response.status === 404 ? null : response.json();
}
