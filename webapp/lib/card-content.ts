import matter from "gray-matter";
import { DOMAINS, PUBLICATION_TYPES } from "./types";
import { getCards } from "./kb";
import { linkKeyReferences, parseKeyReferences } from "./key-references";

export function validateLiteratureContent(slug: string, content: string) {
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;
  const entryType = String(data.entry_type || "");
  const primaryDomain = String(data.primary_domain || "");
  const domains = Array.isArray(data.domains) ? data.domains.map(String) : [];
  const publicationType = String(data.publication_type || "");
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const errors: string[] = [];

  if (!String(data.title || "").trim()) errors.push("title");
  if (entryType !== "literature") errors.push("entry_type: literature");
  if (!DOMAINS.includes(primaryDomain)) errors.push("valid primary domain");
  if (
    !domains.length ||
    !domains.includes(primaryDomain) ||
    domains.some((domain) => !DOMAINS.includes(domain))
  ) {
    errors.push("valid domains including the primary domain");
  }
  if (!PUBLICATION_TYPES.includes(publicationType as (typeof PUBLICATION_TYPES)[number])) {
    errors.push("valid publication type");
  }
  if (tags.length < 1 || tags.length > 6) errors.push("1-6 keyword tags");
  for (const section of [
    "## Summary",
    "## Problem",
    "## Method",
    "## Key results",
    "## Strengths",
    "## Limitations",
    "## Relevance to our group",
    "## Notes",
  ]) {
    if (!parsed.content.includes(section)) errors.push(`${section.slice(3)} section`);
  }
  if (/^## (References|Bibliography|Related work|Works cited)\s*$/im.test(parsed.content)) {
    errors.push("no bibliography section; use key_references metadata");
  }
  if (String(data.citation_key || "") !== slug) {
    errors.push("citation key matching the file name");
  }
  if (!Array.isArray(data.authors) || !data.authors.length) errors.push("authors");
  if (!Number(data.year)) errors.push("year");
  if (errors.length) throw new Error(`Card is incomplete: ${errors.join(", ")}.`);

  if (data.created instanceof Date) data.created = data.created.toISOString().slice(0, 10);
  data.status = "official";
  data.key_references = linkKeyReferences(
    parseKeyReferences(data.key_references),
    getCards(),
    slug,
  );
  return parsed;
}

export function stringifyLiteratureContent(
  parsed: ReturnType<typeof matter>,
): string {
  return matter.stringify(parsed.content.trimStart(), parsed.data);
}
