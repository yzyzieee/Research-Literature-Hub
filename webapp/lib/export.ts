import type { Card } from "./types";

export function cardToPrompt(card: Card, repo?: string): string {
  const meta: string[] = [];
  if (card.authors.length) meta.push(`Authors: ${card.authors.join(", ")}`);
  if (card.year) meta.push(`Year: ${card.year}`);
  if (card.citation_key) meta.push(`Citation key: ${card.citation_key}`);
  if (card.tags.length) meta.push(`Tags: ${card.tags.join(", ")}`);
  meta.push(`Status: ${card.status}`);

  const lines = [
    `## [${card.type}] ${card.title}`,
    "",
    meta.join(" · "),
  ];
  if (card.drive.length) {
    lines.push(`Full text / data on Google Drive: ${card.drive.join(" , ")}`);
  }
  if (repo) {
    lines.push(`Card source 卡片源文件: https://github.com/${repo}/blob/main/${card.folder}/${card.slug}.md`);
  }
  lines.push("", card.body.trim());
  return lines.join("\n");
}

export function bundlePrompt(cards: Card[], repo?: string): string {
  const header = [
    "# Knowledge cards from our audio research knowledge base",
    "",
    `${cards.length} knowledge card(s) on audio / ANC / signal processing follow.`,
    "Use them as trusted context for my next questions. Full-text PDFs are linked per card (Google Drive).",
    "",
    "---",
    "",
  ].join("\n");
  return header + cards.map((c) => cardToPrompt(c, repo)).join("\n\n---\n\n") + "\n";
}

/** Rough token estimate: CJK ≈ 0.6 tok/char, other text ≈ 0.25 tok/char. */
export function estimateTokens(text: string): number {
  const cjk = (text.match(/[一-鿿　-〿]/g) ?? []).length;
  return Math.round(cjk * 0.6 + (text.length - cjk) * 0.25);
}
