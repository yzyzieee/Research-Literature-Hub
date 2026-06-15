// Runtime card reader backed by the GitHub Contents API. The build-time fs
// reader (getCards in kb.ts) only sees the deployment snapshot, so published or
// deleted cards do not show until Vercel rebuilds. These pages instead read the
// repo live, cached under the "cards" tag and busted on every mutation, so the
// library reflects changes within a second or two.
import type { Card } from "./types";
import { githubServerConfig } from "./github-config";
import { getCards, KB_CARD_DIRS, linkCardReferences, parseCardContent } from "./kb";

export const CARDS_TAG = "cards";
const GH = "https://api.github.com";
// Safety net if a change lands outside the app (direct git push) and never busts
// the tag; on-demand revalidateTag still makes in-app edits feel instant.
const REVALIDATE_SECONDS = 300;

interface DirEntry {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

interface ContentFile {
  content: string;
  encoding: string;
}

function ghHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function ghGet<T>(token: string, repo: string, ref: string, path: string): Promise<T | null> {
  const response = await fetch(`${GH}/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`, {
    headers: ghHeaders(token),
    next: { tags: [CARDS_TAG], revalidate: REVALIDATE_SECONDS },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub read ${path} -> ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  return response.json() as Promise<T>;
}

async function readDir(token: string, repo: string, ref: string, dir: string): Promise<Card[]> {
  const entries = (await ghGet<DirEntry[]>(token, repo, ref, dir)) || [];
  if (!Array.isArray(entries)) return [];
  const files = entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".md"));
  const cards = await Promise.all(
    files.map(async (entry) => {
      const file = await ghGet<ContentFile>(token, repo, ref, entry.path);
      if (!file?.content) return null;
      const raw = Buffer.from(file.content.replace(/\n/g, ""), file.encoding as BufferEncoding).toString("utf-8");
      return parseCardContent(entry.name.replace(/\.md$/, ""), dir, raw);
    }),
  );
  return cards.filter((card): card is Card => card !== null);
}

export async function getCardsRemote(): Promise<Card[]> {
  const { token, repo, ref } = githubServerConfig();
  // Local dev or missing config: fall back to the on-disk reader.
  if (!token || !repo) return getCards();
  const groups = await Promise.all(KB_CARD_DIRS.map((dir) => readDir(token, repo, ref, dir)));
  return linkCardReferences(groups.flat());
}

export async function getCardRemote(slug: string): Promise<Card | null> {
  const cards = await getCardsRemote();
  return cards.find((card) => card.slug === slug) ?? null;
}
