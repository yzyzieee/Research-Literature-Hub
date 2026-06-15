import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  ActivityEntry,
  Card,
  CardMeta,
  CardStatus,
  CommentEntry,
  EntryType,
  ExportCardMeta,
  PublicationType,
  RatingAggregate,
  RatingEntry,
} from "./types";
import {
  buildKeyReferenceIndexes,
  linkKeyReferencesWithIndexes,
  parseKeyReferences,
} from "./key-references";
import { parseKeyFigure } from "./key-figure";

const KB_ROOT = process.env.KB_PATH || path.resolve(process.cwd(), "..");
const CARD_DIRS = ["official", "pending"];

function summaryText(body: string): string {
  const lines = body.split(/\r?\n/);
  const para: string[] = [];
  let inSection = false;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inSection) break;
      inSection = line.startsWith("## Summary");
      continue;
    }
    if (!inSection) continue;
    if (line.trim()) para.push(line.trim());
    else if (para.length) break;
  }
  return para.join(" ");
}

function score(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function parseRatings(value: unknown): RatingEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const rating = item as Record<string, unknown>;
    const reviewer = String(rating.reviewer || "").trim();
    if (!reviewer) return [];
    return [{
      reviewer,
      recommendation: score(rating.recommendation),
      innovation: score(rating.innovation),
      rigor: score(rating.rigor),
      updated: String(rating.updated || ""),
    }];
  });
}

function parseAggregate(value: unknown): RatingAggregate | null {
  if (!value || typeof value !== "object") return null;
  const rating = value as Record<string, unknown>;
  const count = score(rating.count);
  if (!count) return null;
  return {
    recommendation: score(rating.recommendation),
    innovation: score(rating.innovation),
    rigor: score(rating.rigor),
    weight: score(rating.weight),
    count,
  };
}

function timestamp(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value || "");
}

function parseActivity(value: unknown): ActivityEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    if (!entry.action || !entry.by || !entry.at) return [];
    return [{
      action: String(entry.action),
      by: String(entry.by),
      at: String(entry.at),
      ...(entry.detail ? { detail: String(entry.detail) } : {}),
    }];
  });
}

function parseComments(value: unknown): CommentEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const comment = item as Record<string, unknown>;
    const id = String(comment.id || "").trim();
    const author = String(comment.author || "").trim();
    const body = String(comment.body || "").trim();
    if (!id || !author || !body) return [];
    return [{
      id,
      author,
      body,
      created: timestamp(comment.created),
      updated: timestamp(comment.updated || comment.created),
    }];
  });
}

function parseCard(filePath: string, folder: string): Card | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const legacyType = String(data.type ?? "");
    const legacySourceType = String(data.source_type ?? "");
    const entryType: EntryType =
      data.entry_type === "literature" || legacyType === "paper" ? "literature" : "legacy-note";
    const legacyDomain = String(data.domain ?? "");
    const primaryDomain = String(data.primary_domain ?? legacyDomain);
    const domains = Array.isArray(data.domains)
      ? data.domains.map(String)
      : primaryDomain
        ? [primaryDomain]
        : [];
    const publicationTypeMap: Record<string, PublicationType> = {
      paper: "journal-paper",
      conference: "conference-paper",
      book: "book",
      patent: "patent",
      other: "other",
    };
    return {
      slug: path.basename(filePath, ".md"),
      folder,
      title: String(data.title ?? path.basename(filePath, ".md")),
      entry_type: entryType,
      publication_type: String(
        data.publication_type ?? publicationTypeMap[legacySourceType] ?? "",
      ) as PublicationType | "",
      primary_domain: primaryDomain,
      domains: [...new Set([primaryDomain, ...domains].filter(Boolean))],
      venue: String(data.venue ?? ""),
      doi: String(data.doi ?? ""),
      abstract: String(data.abstract ?? ""),
      status: (data.status ?? "pending") as CardStatus,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      authors: Array.isArray(data.authors) ? data.authors.map(String) : [],
      year: data.year ? Number(data.year) : null,
      citation_key: String(data.citation_key ?? ""),
      key_references: parseKeyReferences(data.key_references),
      key_figure: parseKeyFigure(data.key_figure),
      related: Array.isArray(data.related) ? data.related.map(String) : [],
      drive: Array.isArray(data.drive) ? data.drive.map(String) : [],
      created: String(data.created ?? ""),
      summary: summaryText(content),
      rating: parseAggregate(data.rating),
      ratings: parseRatings(data.ratings),
      comments: parseComments(data.comments),
      uploaded_by: String(data.uploaded_by ?? ""),
      uploaded_at: String(data.uploaded_at ?? ""),
      pdf_uploaded_by: String(data.pdf_uploaded_by ?? ""),
      pdf_uploaded_at: String(data.pdf_uploaded_at ?? ""),
      pdf_file_name: String(data.pdf_file_name ?? ""),
      pdf_reused: Boolean(data.pdf_reused),
      activity: parseActivity(data.activity),
      legacy_type: legacyType,
      body: content,
    };
  } catch {
    return null;
  }
}

export function getCards(): Card[] {
  const cards: Card[] = [];
  for (const dir of CARD_DIRS) {
    const full = path.join(KB_ROOT, dir);
    if (!fs.existsSync(full)) continue;
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith(".md")) continue;
      const card = parseCard(path.join(full, file), dir);
      if (card) cards.push(card);
    }
  }
  cards.sort((a, b) => a.slug.localeCompare(b.slug));
  const referenceIndexes = buildKeyReferenceIndexes(cards);
  for (const card of cards) {
    card.key_references = linkKeyReferencesWithIndexes(
      card.key_references,
      referenceIndexes,
      card.slug,
    );
  }
  return cards;
}

export function getCard(slug: string): Card | null {
  return getCards().find((c) => c.slug === slug) ?? null;
}

export function toMeta(card: Card): CardMeta {
  const { body: _body, ...meta } = card;
  return meta;
}

export function toExportMeta(card: Card): ExportCardMeta {
  return {
    slug: card.slug,
    folder: card.folder,
    title: card.title,
    publication_type: card.publication_type,
    primary_domain: card.primary_domain,
    domains: card.domains,
    venue: card.venue,
    year: card.year,
    citation_key: card.citation_key,
    key_references: card.key_references,
    tags: card.tags,
    drive: card.drive,
    summary: card.summary,
    rating: card.rating,
    comment_count: card.comments.length,
  };
}
