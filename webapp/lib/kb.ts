import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ActivityEntry, Card, CardMeta, CardStatus, CardType, RatingAggregate, RatingEntry } from "./types";

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

function parseCard(filePath: string, folder: string): Card | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: path.basename(filePath, ".md"),
      folder,
      title: String(data.title ?? path.basename(filePath, ".md")),
      type: (data.type ?? "concept") as CardType,
      domain: String(data.domain ?? ""),
      source_type: String(data.source_type ?? ""),
      status: (data.status ?? "pending") as CardStatus,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      authors: Array.isArray(data.authors) ? data.authors.map(String) : [],
      year: data.year ? Number(data.year) : null,
      citation_key: String(data.citation_key ?? ""),
      related: Array.isArray(data.related) ? data.related.map(String) : [],
      drive: Array.isArray(data.drive) ? data.drive.map(String) : [],
      created: String(data.created ?? ""),
      summary: summaryText(content),
      rating: parseAggregate(data.rating),
      ratings: parseRatings(data.ratings),
      uploaded_by: String(data.uploaded_by ?? ""),
      uploaded_at: String(data.uploaded_at ?? ""),
      pdf_uploaded_by: String(data.pdf_uploaded_by ?? ""),
      pdf_uploaded_at: String(data.pdf_uploaded_at ?? ""),
      pdf_file_name: String(data.pdf_file_name ?? ""),
      pdf_reused: Boolean(data.pdf_reused),
      activity: parseActivity(data.activity),
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
  return cards;
}

export function getCard(slug: string): Card | null {
  return getCards().find((c) => c.slug === slug) ?? null;
}

export function toMeta(card: Card): CardMeta {
  const { body: _body, ...meta } = card;
  return meta;
}
