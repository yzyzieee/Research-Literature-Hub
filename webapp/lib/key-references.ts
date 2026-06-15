import { normalizedDoi, normalizedTitle } from "./duplicates";
import {
  KEY_REFERENCE_ROLES,
  type KeyReference,
  type KeyReferenceRole,
} from "./types";

type LinkableCard = {
  slug: string;
  title: string;
  doi: string;
  folder?: string;
  entry_type?: string;
};

export interface KeyReferenceIndexes {
  doi: Map<string, string>;
  title: Map<string, string>;
}

function optionalYear(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= 1000 && year <= 3000 ? year : null;
}

function oneLine(value: unknown, limit = 400): string {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

export function parseKeyReferences(value: unknown): KeyReference[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = oneLine(record.title, 500);
    if (!title) return [];
    const role: KeyReferenceRole | "" = KEY_REFERENCE_ROLES.includes(record.role as KeyReferenceRole)
      ? (record.role as KeyReferenceRole)
      : "";
    return [{
      title,
      doi: oneLine(record.doi, 200),
      year: optionalYear(record.year),
      role,
      reason: oneLine(record.reason),
      status: "external" as const,
      linked_card: null,
    }];
  }).slice(0, 8);
}

export function buildKeyReferenceIndexes(cards: LinkableCard[]): KeyReferenceIndexes {
  const doiCandidates = new Map<string, string[]>();
  const titleCandidates = new Map<string, string[]>();
  const officialCards = cards.filter(
    (card) =>
      (!card.folder || card.folder === "official") &&
      (!card.entry_type || card.entry_type === "literature"),
  );
  for (const card of officialCards) {
    const doi = normalizedDoi(card.doi);
    const title = normalizedTitle(card.title);
    if (doi) doiCandidates.set(doi, [...(doiCandidates.get(doi) || []), card.slug]);
    if (title.length > 12) {
      titleCandidates.set(title, [...(titleCandidates.get(title) || []), card.slug]);
    }
  }
  return {
    doi: new Map<string, string>(
      [...doiCandidates].flatMap(([key, slugs]): Array<[string, string]> =>
        slugs.length === 1 ? [[key, slugs[0]]] : [],
      ),
    ),
    title: new Map<string, string>(
      [...titleCandidates].flatMap(([key, slugs]): Array<[string, string]> =>
        slugs.length === 1 ? [[key, slugs[0]]] : [],
      ),
    ),
  };
}

export function linkKeyReferencesWithIndexes(
  references: KeyReference[],
  indexes: KeyReferenceIndexes,
  currentSlug?: string,
): KeyReference[] {
  return references.map((reference) => {
    const doi = normalizedDoi(reference.doi);
    const title = normalizedTitle(reference.title);
    const linked = doi
      ? indexes.doi.get(doi)
      : title.length > 12
        ? indexes.title.get(title)
        : undefined;
    return linked && linked !== currentSlug
      ? { ...reference, status: "in_library", linked_card: linked }
      : { ...reference, status: "external", linked_card: null };
  });
}

export function linkKeyReferences(
  references: KeyReference[],
  cards: LinkableCard[],
  currentSlug?: string,
): KeyReference[] {
  return linkKeyReferencesWithIndexes(
    references,
    buildKeyReferenceIndexes(cards),
    currentSlug,
  );
}
