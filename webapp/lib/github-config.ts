export function githubServerConfig() {
  return {
    token: process.env.GITHUB_TOKEN || "",
    repo: String(process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO || "").trim(),
    ref: process.env.GITHUB_BASE || "main",
  };
}
