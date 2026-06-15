import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { CardMeta } from "./types";

export async function renderCardBody(body: string, allCards: CardMeta[]): Promise<string> {
  const bySlug = new Map(allCards.map((c) => [c.slug, c]));
  const withLinks = body.replace(/\[\[([^\]|#]+)\]\]/g, (_m, slug: string) => {
    const target = bySlug.get(slug.trim());
    if (!target) return `\`${slug}\``;
    return `[${target.title}](/cards/${target.slug})`;
  });
  const result = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(withLinks);
  return String(result);
}
