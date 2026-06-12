"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { CardMeta, CardType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import CardListItem from "./CardListItem";

export default function CardSearch({ cards }: { cards: CardMeta[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | CardType>("");

  const fuse = useMemo(
    () =>
      new Fuse(cards, {
        keys: ["title", "tags", "authors", "summary", "citation_key"],
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
          placeholder={t("cards.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value as "" | CardType)}>
          <option value="">{t("cards.allTypes")}</option>
          {(Object.keys(TYPE_LABELS) as CardType[]).map((ct) => (
            <option key={ct} value={ct}>
              {TYPE_LABELS[ct]}
            </option>
          ))}
        </select>
      </div>
      <p className="subtitle" style={{ marginBottom: 12 }}>
        {results.length} / {cards.length} {t("cards.unit")}
      </p>
      <div className="card-grid">
        {results.map((c) => (
          <CardListItem key={c.slug} card={c} />
        ))}
      </div>
    </>
  );
}
