const GH = "https://api.github.com";

export function githubRepositoryCandidates(): string[] {
  return [
    process.env.NEXT_PUBLIC_GITHUB_REPO,
    process.env.GITHUB_REPO,
  ]
    .map((value) => String(value || "").trim())
    .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index);
}

export function configuredGithubRepository(): string {
  return githubRepositoryCandidates()[0] || "";
}

export function githubRef(): string {
  return process.env.GITHUB_BASE || "main";
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function resolveGithubRepository(token: string): Promise<string> {
  const candidates = githubRepositoryCandidates();
  if (!candidates.length) {
    throw new Error("GITHUB_REPO or NEXT_PUBLIC_GITHUB_REPO is not configured.");
  }

  for (const candidate of candidates) {
    const response = await fetch(`${GH}/repos/${candidate}`, {
      headers: headers(token),
      cache: "no-store",
    });
    if (response.status === 404) continue;
    if (!response.ok) {
      throw new Error(
        `GitHub repository check failed (${response.status}) for "${candidate}": ${(await response.text()).slice(0, 200)}`,
      );
    }
    const repository = (await response.json()) as { full_name?: string };
    return String(repository.full_name || candidate);
  }

  throw new Error(
    `GitHub repository is not accessible. Set GITHUB_REPO and NEXT_PUBLIC_GITHUB_REPO to the current owner/repository name, and give GITHUB_TOKEN Contents read/write access. Checked: ${candidates.join(", ")}.`,
  );
}
