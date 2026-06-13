import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Card, CardMeta, CardStatus, CardType } from "./types";

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
