"use client";

import { useState } from "react";
import { BODY_TEMPLATES } from "@/lib/templates";
import type { CardType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";

function kebab(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function yamlList(items: string[]): string {
  return items.length ? `[${items.map((i) => JSON.stringify(i)).join(", ")}]` : "[]";
}

export default function NewCardWizard() {
  const [type, setType] = useState<CardType>("paper");
  const [title, setTitle] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [doi, setDoi] = useState("");
  const [citationKey, setCitationKey] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [tags, setTags] = useState("");
  const [drive, setDrive] = useState("");
  const [notes, setNotes] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"" | "doi" | "draft" | "commit">("");
  const [msg, setMsg] = useState<{ kind: "ok" | "warn"; text: string; link?: string } | null>(null);

  const slug = type === "paper" ? citationKey.trim() : kebab(title);
  const authorList = authors.split(/[;,]/).map((a) => a.trim()).filter(Boolean);
  const tagList = tags.split(/[,，\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
  const driveList = drive.split(/\s+/).map((d) => d.trim()).filter(Boolean);

  const fullMarkdown = () => {
    const today = new Date().toISOString().slice(0, 10);
    const fm = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `title_zh: ${JSON.stringify(titleZh)}`,
      `type: ${type}`,
      "status: pending",
      ...(type === "paper"
        ? [`citation_key: ${citationKey.trim()}`, `authors: ${yamlList(authorList)}`, `year: ${year || "null"}`]
        : []),
      `tags: ${yamlList(tagList)}`,
      `drive: ${yamlList(driveList)}`,
      "related: []",
      `created: ${today}`,
      "reviewed_by: []",
      "---",
      "",
    ].join("\n");
    return fm + (body.trim() ? body.trim() : BODY_TEMPLATES[type].trim()) + "\n";
  };

  const lookupDoi = async () => {
    setBusy("doi");
    setMsg(null);
    try {
      const res = await fetch(`/api/doi?doi=${encodeURIComponent(doi.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle(data.title || title);
      setAuthors((data.authors || []).join(", "));
      setYear(data.year ? String(data.year) : "");
      if (!citationKey) setCitationKey(data.citation_key || "");
      setMsg({ kind: "ok", text: `已从 Crossref 获取元数据。请用 Zotero/Better BibTeX 的 citation key 覆盖建议值。` });
    } catch (e) {
      setMsg({ kind: "warn", text: `DOI 查询失败: ${e}` });
    } finally {
      setBusy("");
    }
  };

  const draftWithClaude = async () => {
    setBusy("draft");
    setMsg(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          title_zh: titleZh,
          authors: authorList,
          year: year ? Number(year) : null,
          citation_key: citationKey,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBody(data.body);
      setMsg({ kind: "ok", text: "草稿已生成（DeepSeek）——请逐节核对后再提交。LLM 只辅助起草，人是最终裁判。" });
    } catch (e) {
      setMsg({ kind: "warn", text: `生成失败: ${e}` });
    } finally {
      setBusy("");
    }
  };

  const submitPr = async () => {
    setBusy("commit");
    setMsg(null);
    try {
      const res = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: fullMarkdown() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ kind: "ok", text: "PR 已创建，等待队友审核:", link: data.pr_url });
    } catch (e) {
      setMsg({ kind: "warn", text: `提交失败: ${e}` });
    } finally {
      setBusy("");
    }
  };

  const download = () => {
    const blob = new Blob([fullMarkdown()], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug || "card"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const ready = title.trim() && slug && /^[a-z0-9][a-z0-9-]*$/.test(slug);

  return (
    <>
      <div className="form-card">
        <label>卡片类型 Card type</label>
        <select value={type} onChange={(e) => setType(e.target.value as CardType)}>
          {(Object.keys(TYPE_LABELS) as CardType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        {type === "paper" && (
          <>
            <label>DOI（可自动抓取元数据 optional auto-fill）</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.1109/PROC.1975.10036" />
              <button className="btn" onClick={lookupDoi} disabled={!doi.trim() || busy !== ""}>
                {busy === "doi" ? "查询中…" : "抓取"}
              </button>
            </div>
          </>
        )}

        <label>英文标题 Title (en) *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>中文标题 Title (zh)</label>
        <input value={titleZh} onChange={(e) => setTitleZh(e.target.value)} />

        {type === "paper" && (
          <>
            <label>Citation key（Better BibTeX，作为文件名）*</label>
            <input value={citationKey} onChange={(e) => setCitationKey(e.target.value)} placeholder="widrow1975adaptive" />
            <label>作者 Authors（逗号分隔）</label>
            <input value={authors} onChange={(e) => setAuthors(e.target.value)} />
            <label>年份 Year</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} />
          </>
        )}

        <label>标签 Tags（逗号/空格分隔，小写）</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="anc, adaptive-filter" />

        <label>Google Drive 链接（PDF/数据，空格分隔）</label>
        <input value={drive} onChange={(e) => setDrive(e.target.value)} />

        <label>起草要点提示 Notes for drafting（可选）</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="想突出的重点、与课题的关联、需要展开的小节…" />

        {slug && <p className="subtitle" style={{ margin: "10px 0 0" }}>文件名 file: <code>90_pending/{slug}.md</code></p>}
      </div>

      <div className="form-card">
        <label>正文 Body（留空则使用模板骨架；可先用 Claude 生成再修改）</label>
        <div className="btn-row" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={draftWithClaude} disabled={!title.trim() || busy !== ""}>
            {busy === "draft" ? "起草中…" : "✨ 用 DeepSeek 生成双语草稿"}
          </button>
          <button className="btn" onClick={() => setBody(BODY_TEMPLATES[type].trim())} disabled={busy !== ""}>
            插入空白模板
          </button>
        </div>
        <textarea rows={18} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      {msg && (
        <div className={`notice ${msg.kind}`}>
          {msg.text} {msg.link && <a href={msg.link} target="_blank" rel="noreferrer">{msg.link}</a>}
        </div>
      )}

      <div className="btn-row">
        <button className="btn primary" onClick={submitPr} disabled={!ready || busy !== ""}>
          {busy === "commit" ? "提交中…" : "提交 PR 到 90_pending"}
        </button>
        <button className="btn" onClick={download} disabled={!ready}>下载 .md</button>
        <button className="btn" onClick={() => navigator.clipboard.writeText(fullMarkdown())} disabled={!ready}>
          复制 Markdown
        </button>
      </div>
    </>
  );
}
