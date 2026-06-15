import type { Card } from "./types";

export interface DuplicateCandidate {
  slug: string;
  title: string;
  authors: string[];
  year: number | null;
  doi: string;
  citation_key: string;
  summary: string;
  card_url: string;
  drive: string[];
  reasons: string[];
  score: number;
}

export interface DuplicateQuery {
  title?: string;
  doi?: string;
  citation_key?: string;
  authors?: string[];
  year?: number | null;
}

export function normalizedDoi(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

export function normalizedTitle(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleTokens(value: unknown): Set<string> {
  const stop = new Set(["a", "an", "and", "for", "in", "of", "on", "the", "to", "with"]);
  return new Set(
    normalizedTitle(value)
      .split(" ")
      .filter((token) => token.length > 2 && !stop.has(token)),
  );
}

function titleSimilarity(left: unknown, right: unknown): number {
  const a = titleTokens(left);
  const b = titleTokens(right);
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return (2 * common) / (a.size + b.size);
}

function firstAuthorFamily(authors: string[] | undefined): string {
  const first = String(authors?.[0] || "").trim();
  return first.split(/\s+/).pop()?.toLowerCase() || "";
}

export function findDuplicateCandidates(cards: Card[], query: DuplicateQuery): DuplicateCandidate[] {
  const wantedDoi = normalizedDoi(query.doi);
  const wantedTitle = normalizedTitle(query.title);
  const wantedKey = String(query.citation_key || "").trim().toLowerCase();
  const wantedAuthor = firstAuthorFamily(query.authors);

  return cards
    .filter((card) => card.folder === "official" && card.entry_type === "literature")
    .flatMap((card) => {
      const reasons: string[] = [];
      let score = 0;
      const cardDoi = normalizedDoi(card.doi);
      const cardTitle = normalizedTitle(card.title);
      const cardKey = String(card.citation_key || card.slug).toLowerCase();
      const similarity = titleSimilarity(wantedTitle, cardTitle);

      if (wantedDoi && cardDoi && wantedDoi === cardDoi) {
        reasons.push("doi");
        score = Math.max(score, 100);
      }
      if (wantedKey && wantedKey === cardKey) {
        reasons.push("citation_key");
        score = Math.max(score, 98);
      }
      if (wantedTitle.length > 12 && wantedTitle === cardTitle) {
        reasons.push("title");
        score = Math.max(score, 96);
      } else if (similarity >= 0.82) {
        reasons.push("similar_title");
        score = Math.max(score, Math.round(similarity * 90));
      }

      const sameYear = Boolean(query.year && card.year && Number(query.year) === card.year);
      const sameAuthor = Boolean(wantedAuthor && wantedAuthor === firstAuthorFamily(card.authors));
      if (similarity >= 0.68 && sameYear && sameAuthor) {
        reasons.push("author_year_title");
        score = Math.max(score, Math.round(similarity * 85));
      }

      if (!reasons.length) return [];
      return [{
        slug: card.slug,
        title: card.title,
        authors: card.authors,
        year: card.year,
        doi: card.doi,
        citation_key: card.citation_key || card.slug,
        summary: card.summary,
        card_url: `/cards/${encodeURIComponent(card.slug)}`,
        drive: card.drive,
        reasons,
        score,
      }];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
