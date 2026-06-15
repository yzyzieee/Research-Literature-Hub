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
};

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

export function linkKeyReferences(
  references: KeyReference[],
  cards: LinkableCard[],
  currentSlug?: string,
): KeyReference[] {
  const candidates = cards.filter((card) => card.slug !== currentSlug);
  return references.map((reference) => {
    const doi = normalizedDoi(reference.doi);
    let match: LinkableCard | undefined;
    if (doi) {
      match = candidates.find((card) => normalizedDoi(card.doi) === doi);
    }
    if (!match && !doi) {
      const title = normalizedTitle(reference.title);
      if (title.length > 12) {
        const titleMatches = candidates.filter(
          (card) => normalizedTitle(card.title) === title,
        );
        if (titleMatches.length === 1) match = titleMatches[0];
      }
    }
    return match
      ? { ...reference, status: "in_library", linked_card: match.slug }
      : { ...reference, status: "external", linked_card: null };
  });
}
