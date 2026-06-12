import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { CardMeta } from "./types";

export async function renderCardBody(body: string, allCards: CardMeta[]): Promise<string> {
  const bySlug = new Map(allCards.map((c) => [c.slug, c]));
  const withLinks = body.replace(/\[\[([^\]|#]+)\]\]/g, (_m, slug: string) => {
    const target = bySlug.get(slug.trim());
    if (!target) return `\`${slug}\``;
    return `[${target.title}](/cards/${target.slug})`;
  });
  const result = await remark().use(remarkGfm).use(remarkHtml).process(withLinks);
  return String(result);
}
