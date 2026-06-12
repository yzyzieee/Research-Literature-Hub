"use client";

import { useMemo, useState } from "react";
import type { Card, CardType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { bundlePrompt, estimateTokens } from "@/lib/export";
import CopyButton from "./CopyButton";

export default function ExportBuilder({ cards, repo }: { cards: Card[]; repo?: string }) {
  const [type, setType] = useState<"" | CardType>("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (!type || c.type === type) &&
        (!f ||
          c.title.toLowerCase().includes(f) ||
          c.title_zh.includes(filter.trim()) ||
          c.tags.some((t) => t.includes(f))),
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
          placeholder="按标题 / 标签过滤…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value as "" | CardType)}>
          <option value="">全部类型</option>
          {(Object.keys(TYPE_LABELS) as CardType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <button className="btn" onClick={() => setSelected(new Set([...selected, ...visible.map((c) => c.slug)]))}>
          全选当前
        </button>
        <button className="btn" onClick={() => setSelected(new Set())}>清空</button>
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
              <span className="titles">
                {c.title}
                {c.title_zh && <span className="zh">{c.title_zh}</span>}
              </span>
              <span className="meta-row">
                <span className="badge type">{TYPE_LABELS[c.type]}</span>
                {c.drive.length > 0 && <span className="badge">📎 有全文链接</span>}
                {c.tags.map((t) => (
                  <span key={t} className="badge">#{t}</span>
                ))}
              </span>
            </span>
          </label>
        ))}
      </div>

      {chosen.length > 0 && (
        <div className="form-card">
          <b>
            已选 {chosen.length} 张卡片 · 约 {tokens.toLocaleString()} tokens
          </b>
          <p className="subtitle" style={{ margin: "6px 0 12px" }}>
            复制后直接粘贴到任意 LLM（ChatGPT / Claude / Kimi / 元宝…）作为上下文；
            包内已附每张卡的 Drive 全文链接与 GitHub 源链接。
          </p>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <CopyButton text={bundle} label={`复制卡片包（${chosen.length} 张）`} primary />
            <button className="btn" onClick={download}>下载 .md</button>
          </div>
          <label style={{ marginTop: 14 }}>预览 Preview</label>
          <textarea rows={12} readOnly value={bundle} />
        </div>
      )}
    </>
  );
}
