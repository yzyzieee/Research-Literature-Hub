import { githubServerConfig } from "./github-config";
import {
  DEFAULT_DOMAIN_REGISTRY,
  DOMAIN_REGISTRY_FILE,
  DomainRegistry,
  normalizedDomainRegistry,
} from "./domain-registry";

const GH = "https://api.github.com";

interface GitHubRegistryFile {
  sha: string;
  content: string;
  encoding: string;
}

export async function readDomainRegistry(): Promise<{ registry: DomainRegistry; sha?: string }> {
  const { token, repo, ref } = githubServerConfig();
  if (!token || !repo) {
    return { registry: normalizedDomainRegistry(DEFAULT_DOMAIN_REGISTRY) };
  }
  const params = new URLSearchParams({ ref });
  const response = await fetch(`${GH}/repos/${repo}/contents/${DOMAIN_REGISTRY_FILE}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (response.status === 404) {
    return { registry: normalizedDomainRegistry(DEFAULT_DOMAIN_REGISTRY) };
  }
  if (!response.ok) {
    throw new Error(
      `Domain registry read failed (${response.status}): ${(await response.text()).slice(0, 200)}`,
    );
  }
  const file = (await response.json()) as GitHubRegistryFile;
  const raw = Buffer.from(
    file.content.replace(/\n/g, ""),
    file.encoding as BufferEncoding,
  ).toString("utf-8");
  return { registry: normalizedDomainRegistry(JSON.parse(raw)), sha: file.sha };
}

export async function writeDomainRegistry(registry: DomainRegistry, sha?: string): Promise<void> {
  const { token, repo, ref } = githubServerConfig();
  if (!token || !repo) throw new Error("GITHUB_TOKEN / GITHUB_REPO is not configured.");
  const response = await fetch(`${GH}/repos/${repo}/contents/${DOMAIN_REGISTRY_FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "taxonomy: update research domain registry",
      content: Buffer.from(
        JSON.stringify(normalizedDomainRegistry(registry), null, 2) + "\n",
        "utf-8",
      ).toString("base64"),
      ...(sha ? { sha } : {}),
      branch: ref,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Domain registry write failed (${response.status}): ${(await response.text()).slice(0, 200)}`,
    );
  }
}
