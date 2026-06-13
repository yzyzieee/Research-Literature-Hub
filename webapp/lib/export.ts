import type { Card } from "./types";

/** Turn a Drive view link into a direct-download link (one-click PDF download). */
export function driveDownloadUrl(link: string): string {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : link;
}

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
    const dl = card.drive.map(driveDownloadUrl).join(" , ");
    lines.push(`Download original PDF 下载原文: ${dl}`);
  }
  if (repo) {
    lines.push(`Card source 卡片源文件: https://github.com/${repo}/blob/main/${card.folder}/${card.slug}.md`);
  }
  lines.push("", card.body.trim());
  return lines.join("\n");
}

export function bundlePrompt(cards: Card[], repo?: string): string {
  const header = [
    "# Our audio research knowledge base — use this as your library",
    "",
    `Below are ${cards.length} English knowledge cards from our group's library (audio / ANC / signal processing).`,
    "Each card has metadata (type, domain, tags), a distilled summary, and — when a PDF exists — a direct download link.",
    "",
    "How to work with me:",
    "- Treat these cards as your trusted knowledge base. I will tell you what direction or question I want to research — the topic is mine to choose.",
    "- Answer using these cards as the primary source. If the library does not cover something I ask, say so explicitly rather than guessing.",
    "- Whenever you recommend or cite a paper, ALWAYS list it as: `<title> — <citation_key> — <download link>`, so I can fetch the originals. Only use links and papers that appear in the cards; never invent them.",
    "- A good answer usually ends with a short reference list in that format.",
    "",
    "---",
    "",
  ].join("\n");
  return header + cards.map((c) => cardToPrompt(c, repo)).join("\n\n---\n\n") + "\n";
}

/**
 * Match cards against a free-text reference list pasted back from an LLM,
 * by citation key, slug, or title. Returns matched cards (deduped, order kept).
 */
export function matchCardsFromText(cards: Card[], text: string): Card[] {
  const hay = text.toLowerCase();
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const c of cards) {
    const keys = [c.citation_key, c.slug].filter(Boolean).map((s) => s.toLowerCase());
    const byKey = keys.some((k) => hay.includes(k));
    const byTitle = c.title.length > 8 && hay.includes(c.title.toLowerCase());
    if ((byKey || byTitle) && !seen.has(c.slug)) {
      seen.add(c.slug);
      out.push(c);
    }
  }
  return out;
}

/** Rough token estimate: CJK ≈ 0.6 tok/char, other text ≈ 0.25 tok/char. */
export function estimateTokens(text: string): number {
  const cjk = (text.match(/[一-鿿　-〿]/g) ?? []).length;
  return Math.round(cjk * 0.6 + (text.length - cjk) * 0.25);
}
