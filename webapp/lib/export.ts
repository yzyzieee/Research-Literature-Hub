import type { Card, ExportCardMeta } from "./types";
import { domainLabel, publicationTypeLabel } from "./types";

const DEFAULT_REPO = "yzyzieee/Literature_ANC_Database";

export function catalogUrls(repo = DEFAULT_REPO) {
  const base = `https://raw.githubusercontent.com/${repo}/main/index`;
  return {
    markdown: `${base}/llm_catalog.md`,
    json: `${base}/llm_catalog.json`,
  };
}

export function libraryAccessPrompt(idea: string, repo?: string): string {
  const urls = catalogUrls(repo);
  return [
    "I want you to use our internal literature library as your main source.",
    "",
    `Library catalog: ${urls.markdown}`,
    `Machine-readable catalog: ${urls.json}`,
    "",
    "Rules:",
    "1. Start from the catalog.",
    "2. Search only inside this library first.",
    "3. Select relevant papers based on title, summary, domains, tags, venue, year, and team weight.",
    "4. Then open only the most relevant card files.",
    "5. Do not claim that a paper exists unless it appears in the catalog or a linked card.",
    "6. Treat team comments as attributed interpretation, not source-paper claims.",
    "7. Drive PDF links may be private; do not assume you can access them.",
    "",
    "My research idea:",
    idea.trim() || "[Describe your research idea here]",
    "",
    "Please return:",
    "1. relevant papers from our library",
    "2. why each paper is relevant",
    "3. suggested reading order",
    "4. which papers are core vs background",
    "5. useful keywords for the next discussion",
    "6. each paper's title, citation key, and card URL",
  ].join("\n");
}

function compactSummary(value: string, limit = 420): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trim()}…`;
}

export function compactCatalogPrompt(cards: ExportCardMeta[], idea: string, repo?: string): string {
  const repository = repo || DEFAULT_REPO;
  const lines = [
    "# Audio Literature Hub — compact catalog pack",
    "",
    "Use only this internal catalog for the first-pass literature search.",
    "Do not invent papers. Ask for selected full card records before making detailed technical claims.",
    "",
    "Research idea:",
    idea.trim() || "[Describe the research idea here]",
    "",
    `Catalog entries: ${cards.length}`,
    "",
  ];
  for (const card of cards) {
    const weight = card.rating ? String(card.rating.weight) : "unrated";
    lines.push(
      `## ${card.citation_key || card.slug}`,
      `Title: ${card.title}`,
      `Year: ${card.year || "unknown"} | Venue: ${card.venue || "unknown"} | Type: ${publicationTypeLabel(card.publication_type)}`,
      `Primary domain: ${card.primary_domain} | Domains: ${card.domains.join(", ")}`,
      `Tags: ${card.tags.join(", ")} | Team weight: ${weight}`,
      `Summary: ${compactSummary(card.summary)}`,
      `Card: https://raw.githubusercontent.com/${repository}/main/${card.folder}/${card.slug}.md`,
      "",
    );
  }
  lines.push(
    "Return the most relevant papers, relevance reasons, reading order, core/background grouping, and citation keys.",
  );
  return lines.join("\n");
}

/** Turn a Drive view link into a direct-download link. */
export function driveDownloadUrl(link: string): string {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : link;
}

export function cardToPrompt(card: Card, repo?: string): string {
  const meta: string[] = [];
  if (card.authors.length) meta.push(`Authors: ${card.authors.join(", ")}`);
  if (card.year) meta.push(`Year: ${card.year}`);
  if (card.publication_type) meta.push(`Publication type: ${publicationTypeLabel(card.publication_type)}`);
  if (card.primary_domain) meta.push(`Primary domain: ${domainLabel(card.primary_domain)}`);
  if (card.domains.length) meta.push(`Research domains: ${card.domains.map(domainLabel).join(", ")}`);
  if (card.venue) meta.push(`Venue: ${card.venue}`);
  if (card.doi) meta.push(`DOI: ${card.doi}`);
  if (card.abstract) meta.push(`Abstract: ${card.abstract}`);
  if (card.citation_key) meta.push(`Citation key: ${card.citation_key}`);
  if (card.tags.length) meta.push(`Tags: ${card.tags.join(", ")}`);
  if (card.rating) {
    meta.push(
      `Team weight: ${card.rating.weight}/100 (${card.rating.count} rating${card.rating.count === 1 ? "" : "s"})`,
    );
  }
  if (card.uploaded_by) meta.push(`Uploaded by: ${card.uploaded_by}`);
  meta.push(`Status: ${card.status}`);

  const lines = [`## ${card.title}`, "", meta.join(" · ")];
  if (card.drive.length) {
    lines.push(`Download original PDF: ${card.drive.map(driveDownloadUrl).join(", ")}`);
  }
  if (repo) {
    lines.push(
      `Card source: https://raw.githubusercontent.com/${repo}/main/${card.folder}/${card.slug}.md`,
    );
  }
  lines.push("", card.body.trim());
  if (card.comments.length) {
    lines.push(
      "",
      "### Team member comments",
      "",
      "These are attributed team interpretations or practical notes, not claims copied from the source paper.",
      "",
    );
    for (const comment of card.comments) {
      lines.push(
        `#### ${comment.author} · ${comment.updated || comment.created}`,
        "",
        comment.body.trim(),
        "",
      );
    }
  }
  return lines.join("\n");
}

export function bundlePrompt(cards: Card[], repo = DEFAULT_REPO): string {
  const header = [
    "# Audio Literature Hub — selected full paper pack",
    "",
    `Below are ${cards.length} full literature records from our group's audio research library.`,
    "Use these records for deep discussion after the catalog has narrowed the candidate set.",
    "",
    "Rules:",
    "- Treat these records as trusted group context.",
    "- If the selected records do not cover the question, say so explicitly.",
    "- Treat team comments as attributed interpretation, not verified paper claims.",
    "- Cite papers as `<title> — <citation_key> — <card or PDF link>`.",
    "- Never invent papers, links, results, or claims.",
    "",
    "---",
    "",
  ].join("\n");
  return header + cards.map((card) => cardToPrompt(card, repo)).join("\n\n---\n\n") + "\n";
}

export function matchCardsFromText<T extends ExportCardMeta>(cards: T[], text: string): T[] {
  const haystack = text.toLowerCase();
  const seen = new Set<string>();
  const output: T[] = [];
  for (const card of cards) {
    const keys = [card.citation_key, card.slug].filter(Boolean).map((value) => value.toLowerCase());
    const byKey = keys.some((key) => haystack.includes(key));
    const byTitle = card.title.length > 8 && haystack.includes(card.title.toLowerCase());
    if ((byKey || byTitle) && !seen.has(card.slug)) {
      seen.add(card.slug);
      output.push(card);
    }
  }
  return output;
}

/** Rough token estimate: CJK ~0.6 token/char, other text ~0.25 token/char. */
export function estimateTokens(text: string): number {
  const cjk = (text.match(/[\u3400-\u9fff\u3000-\u303f]/g) ?? []).length;
  return Math.round(cjk * 0.6 + (text.length - cjk) * 0.25);
}
