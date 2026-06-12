"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { CardMeta, CardType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import CardListItem from "./CardListItem";

export default function CardSearch({ cards }: { cards: CardMeta[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | CardType>("");

  const fuse = useMemo(
    () =>
      new Fuse(cards, {
        keys: ["title", "title_zh", "tags", "authors", "summary", "summary_zh", "citation_key"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [cards],
  );

  const results = useMemo(() => {
    const base = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : cards;
    return type ? base.filter((c) => c.type === type) : base;
  }, [query, type, cards, fuse]);

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder="搜索标题 / 标签 / 作者 / 摘要 … search anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value as "" | CardType)}>
          <option value="">全部类型 all types</option>
          {(Object.keys(TYPE_LABELS) as CardType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <p className="subtitle" style={{ marginBottom: 12 }}>
        {results.length} / {cards.length} 张卡片
      </p>
      <div className="card-grid">
        {results.map((c) => (
          <CardListItem key={c.slug} card={c} />
        ))}
      </div>
    </>
  );
}
