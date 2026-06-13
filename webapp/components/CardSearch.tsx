"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { CardMeta, CardType } from "@/lib/types";
import { DOMAINS, TYPE_LABELS, domainLabel } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import CardListItem from "./CardListItem";

export default function CardSearch({ cards }: { cards: CardMeta[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | CardType>("");
  const [domain, setDomain] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(cards, {
        keys: ["title", "tags", "authors", "summary", "citation_key", "domain"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [cards],
  );

  const results = useMemo(() => {
    let base = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : cards;
    if (type) base = base.filter((c) => c.type === type);
    if (domain) base = base.filter((c) => c.domain === domain);
    return base;
  }, [query, type, domain, cards, fuse]);

  // Group by domain (domains in the canonical order, unknown last).
  const grouped = useMemo(() => {
    const order = [...DOMAINS, ""];
    const byDomain = new Map<string, CardMeta[]>();
    for (const c of results) {
      const d = DOMAINS.includes(c.domain) ? c.domain : "";
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d)!.push(c);
    }
    return order.filter((d) => byDomain.has(d)).map((d) => ({ domain: d, items: byDomain.get(d)! }));
  }, [results]);

  // Domains present in the data, for the filter dropdown.
  const presentDomains = useMemo(
    () => DOMAINS.filter((d) => cards.some((c) => c.domain === d)),
    [cards],
  );

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder={t("cards.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">{t("cards.allDomains")}</option>
          {presentDomains.map((d) => (
            <option key={d} value={d}>
              {domainLabel(d)}
            </option>
          ))}
        </select>
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
      {grouped.map((g) => (
        <section key={g.domain || "unsorted"} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>
            {domainLabel(g.domain)} <span className="subtitle" style={{ fontSize: 13 }}>· {g.items.length}</span>
          </h2>
          <div className="card-grid">
            {g.items.map((c) => (
              <CardListItem key={c.slug} card={c} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
