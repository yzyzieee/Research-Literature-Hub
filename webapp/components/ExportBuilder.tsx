"use client";

import { useMemo, useState } from "react";
import type { Card, CardType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { bundlePrompt, estimateTokens } from "@/lib/export";
import { useLang } from "@/lib/i18n";
import CopyButton from "./CopyButton";

export default function ExportBuilder({ cards, repo }: { cards: Card[]; repo?: string }) {
  const { t } = useLang();
  const [type, setType] = useState<"" | CardType>("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (!type || c.type === type) &&
        (!f || c.title.toLowerCase().includes(f) || c.tags.some((tag) => tag.includes(f))),
    );
  }, [cards, type, filter]);

  const chosen = cards.filter((c) => selected.has(c.slug));
  const bundle = useMemo(() => (chosen.length ? bundlePrompt(chosen, repo) : ""), [chosen, repo]);
  const tokens = useMemo(() => (bundle ? estimateTokens(bundle) : 0), [bundle]);

  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  };

  const download = () => {
    const blob = new Blob([bundle], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kb-bundle-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder={t("export.filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value as "" | CardType)}>
          <option value="">{t("export.allTypes")}</option>
          {(Object.keys(TYPE_LABELS) as CardType[]).map((ct) => (
            <option key={ct} value={ct}>{TYPE_LABELS[ct]}</option>
          ))}
        </select>
        <button className="btn" onClick={() => setSelected(new Set([...selected, ...visible.map((c) => c.slug)]))}>
          {t("export.selectAll")}
        </button>
        <button className="btn" onClick={() => setSelected(new Set())}>{t("export.clear")}</button>
      </div>

      <div className="card-grid" style={{ marginBottom: 20 }}>
        {visible.map((c) => (
          <label key={c.slug} className="card-item" style={{ display: "flex", gap: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selected.has(c.slug)}
              onChange={() => toggle(c.slug)}
              style={{ width: "auto", marginTop: 4 }}
            />
            <span>
              <span className="titles">{c.title}</span>
              <span className="meta-row">
                <span className="badge type">{TYPE_LABELS[c.type]}</span>
                {c.drive.length > 0 && <span className="badge">{t("export.hasFulltext")}</span>}
                {c.tags.map((tag) => (
                  <span key={tag} className="badge">#{tag}</span>
                ))}
              </span>
            </span>
          </label>
        ))}
      </div>

      {chosen.length > 0 && (
        <div className="form-card">
          <b>
            {chosen.length} {t("export.selected")} · ~{tokens.toLocaleString()} tokens
          </b>
          <p className="subtitle" style={{ margin: "6px 0 12px" }}>
            {t("export.hint")}
          </p>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <CopyButton text={bundle} label={t("export.copy")} primary />
            <button className="btn" onClick={download}>{t("export.download")}</button>
          </div>
          <label style={{ marginTop: 14 }}>{t("export.preview")}</label>
          <textarea rows={12} readOnly value={bundle} />
        </div>
      )}
    </>
  );
}
