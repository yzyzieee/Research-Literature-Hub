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
  sha: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

interface Blob {
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

// The only per-render cost: list each card directory. Tag-busted on mutation so
// new/deleted cards are seen instantly; `fresh` bypasses the cache for the
// authoritative publish-time duplicate guard.
async function listDir(token: string, repo: string, ref: string, dir: string, fresh: boolean): Promise<DirEntry[]> {
  const response = await fetch(`${GH}/repos/${repo}/contents/${dir}?ref=${encodeURIComponent(ref)}`, {
    headers: ghHeaders(token),
    ...(fresh ? { cache: "no-store" } : { next: { tags: [CARDS_TAG], revalidate: REVALIDATE_SECONDS } }),
  });
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`GitHub list ${dir} -> ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  const entries = await response.json();
  return Array.isArray(entries) ? (entries as DirEntry[]) : [];
}

// Blobs are content-addressed (the SHA *is* the content hash), so a given SHA is
// immutable: cache it indefinitely. An edited card gets a new SHA -> new URL ->
// fetched once; unchanged cards are never re-fetched, even on a cold render.
async function readBlob(token: string, repo: string, sha: string): Promise<string | null> {
  const response = await fetch(`${GH}/repos/${repo}/git/blobs/${sha}`, {
    headers: ghHeaders(token),
    next: { revalidate: false },
  });
  if (!response.ok) return null;
  const blob = (await response.json()) as Blob;
  if (!blob.content) return null;
  return Buffer.from(blob.content.replace(/\n/g, ""), blob.encoding as BufferEncoding).toString("utf-8");
}

async function readDir(token: string, repo: string, ref: string, dir: string, fresh: boolean): Promise<Card[]> {
  const entries = await listDir(token, repo, ref, dir, fresh);
  const files = entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".md"));
  const cards = await Promise.all(
    files.map(async (entry) => {
      const raw = await readBlob(token, repo, entry.sha);
      return raw ? parseCardContent(entry.name.replace(/\.md$/, ""), dir, raw) : null;
    }),
  );
  return cards.filter((card): card is Card => card !== null);
}

export async function getCardsRemote({ fresh = false }: { fresh?: boolean } = {}): Promise<Card[]> {
  const { token, repo, ref } = githubServerConfig();
  // Local dev or missing config: fall back to the on-disk reader.
  if (!token || !repo) return getCards();
  try {
    const groups = await Promise.all(KB_CARD_DIRS.map((dir) => readDir(token, repo, ref, dir, fresh)));
    return linkCardReferences(groups.flat());
  } catch (error) {
    // GitHub outage / rate limit: serve the build-time snapshot (stale but complete,
    // bundled via outputFileTracingIncludes) instead of failing the page.
    console.warn("Live GitHub card read failed; serving the on-disk snapshot.", error);
    return getCards();
  }
}

export async function getCardRemote(slug: string): Promise<Card | null> {
  const cards = await getCardsRemote();
  return cards.find((card) => card.slug === slug) ?? null;
}
