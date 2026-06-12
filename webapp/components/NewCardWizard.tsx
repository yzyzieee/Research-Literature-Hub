"use client";

import { useRef, useState } from "react";
import { BODY_TEMPLATES } from "@/lib/templates";
import type { CardType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { extractPdfText } from "@/lib/pdf";
import { uploadToDrive } from "@/lib/drive";

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
  const { t } = useLang();
  const [type, setType] = useState<CardType>("paper");
  const [title, setTitle] = useState("");
  const [doi, setDoi] = useState("");
  const [citationKey, setCitationKey] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [tags, setTags] = useState("");
  const [drive, setDrive] = useState("");
  const [notes, setNotes] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"" | "doi" | "draft" | "commit" | "pdf" | "drive">("");
  const [pdfName, setPdfName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "warn"; text: string; link?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const driveFolder = process.env.NEXT_PUBLIC_DRIVE_FOLDER_URL;
  const driveUploadEnabled = process.env.NEXT_PUBLIC_DRIVE_UPLOAD === "1";

  const slug = type === "paper" ? citationKey.trim() : kebab(title);
  const authorList = authors.split(/[;,]/).map((a) => a.trim()).filter(Boolean);
  const tagList = tags.split(/[,，\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
  const driveList = drive.split(/\s+/).map((d) => d.trim()).filter(Boolean);

  const fullMarkdown = () => {
    const today = new Date().toISOString().slice(0, 10);
    const fm = [
      "---",
      `title: ${JSON.stringify(title)}`,
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

  const uploadDrive = async () => {
    if (!pdfFile || !driveUploadEnabled) return;
    setBusy("drive");
    setMsg(null);
    try {
      const link = await uploadToDrive(pdfFile);
      setDrive(link);
      setMsg({ kind: "ok", text: t("new.driveUploaded"), link });
    } catch (e) {
      setMsg({ kind: "warn", text: `${t("new.driveUploadFail")}: ${e instanceof Error ? e.message : e}` });
    } finally {
      setBusy("");
    }
  };

  const onPdf = async (file: File | undefined) => {
    if (!file) return;
    setBusy("pdf");
    setMsg(null);
    setPdfName(file.name);
    setPdfFile(file);
    try {
      const text = await extractPdfText(file);
      if (text.length < 80) throw new Error(t("new.pdfNoText"));
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.type && TYPE_LABELS[data.type as CardType]) setType(data.type);
      setTitle(data.title || "");
      setAuthors((data.authors || []).join(", "));
      setYear(data.year ? String(data.year) : "");
      setCitationKey(data.citation_key || "");
      setTags((data.tags || []).join(", "));
      setBody(data.body || "");
      setMsg({ kind: "ok", text: t("new.pdfOk") });
    } catch (e) {
      setMsg({ kind: "warn", text: `${t("new.pdfFail")}: ${e instanceof Error ? e.message : e}` });
    } finally {
      setBusy("");
    }
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
      setMsg({ kind: "ok", text: t("new.doiOk") });
    } catch (e) {
      setMsg({ kind: "warn", text: `${t("new.doiFail")}: ${e}` });
    } finally {
      setBusy("");
    }
  };

  const draft = async () => {
    setBusy("draft");
    setMsg(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          authors: authorList,
          year: year ? Number(year) : null,
          citation_key: citationKey,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBody(data.body);
      setMsg({ kind: "ok", text: t("new.draftOk") });
    } catch (e) {
      setMsg({ kind: "warn", text: `${t("new.draftFail")}: ${e}` });
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
      setMsg({ kind: "ok", text: `${t("new.prOk")}:`, link: data.pr_url });
    } catch (e) {
      setMsg({ kind: "warn", text: `${t("new.prFail")}: ${e}` });
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
      <div className="pdf-zone">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(e) => onPdf(e.target.files?.[0])}
        />
        <div className="pdf-zone-main">
          <div>
            <b>{t("new.pdfTitle")}</b>
            <p className="subtitle" style={{ margin: "4px 0 0" }}>{t("new.pdfHint")}</p>
          </div>
          <button className="btn primary" onClick={() => fileRef.current?.click()} disabled={busy !== ""}>
            {busy === "pdf" ? t("new.pdfBusy") : t("new.pdfBtn")}
          </button>
        </div>
        {pdfName && (
          <div className="pdf-zone-main" style={{ marginTop: 8 }}>
            <p className="subtitle" style={{ margin: 0 }}>📄 {pdfName}</p>
            {driveUploadEnabled && (
              <button className="btn" onClick={uploadDrive} disabled={!pdfFile || busy !== ""}>
                {busy === "drive" ? t("new.driveUploading") : t("new.driveUpload")}
              </button>
            )}
          </div>
        )}
        <p className="subtitle" style={{ margin: "10px 0 0" }}>
          {driveUploadEnabled ? t("new.driveAuto") : t("new.driveReminder")}
          {driveFolder && (
            <>
              {" "}
              <a href={driveFolder} target="_blank" rel="noreferrer">{t("new.driveOpen")}</a>
            </>
          )}
        </p>
      </div>

      <div className="form-card">
        <label>{t("new.type")}</label>
        <select value={type} onChange={(e) => setType(e.target.value as CardType)}>
          {(Object.keys(TYPE_LABELS) as CardType[]).map((ct) => (
            <option key={ct} value={ct}>{TYPE_LABELS[ct]}</option>
          ))}
        </select>

        {type === "paper" && (
          <>
            <label>{t("new.doi")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.1109/PROC.1975.10036" />
              <button className="btn" onClick={lookupDoi} disabled={!doi.trim() || busy !== ""}>
                {busy === "doi" ? t("new.fetching") : t("new.fetch")}
              </button>
            </div>
          </>
        )}

        <label>{t("new.cardTitle")}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        {type === "paper" && (
          <>
            <label>{t("new.citationKey")}</label>
            <input value={citationKey} onChange={(e) => setCitationKey(e.target.value)} placeholder="widrow1975adaptive" />
            <label>{t("new.authors")}</label>
            <input value={authors} onChange={(e) => setAuthors(e.target.value)} />
            <label>{t("new.year")}</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} />
          </>
        )}

        <label>{t("new.tags")}</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="anc, adaptive-filter" />

        <label>{t("new.drive")}</label>
        <input value={drive} onChange={(e) => setDrive(e.target.value)} />

        <label>{t("new.notes")}</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("new.notesPh")} />

        {slug && <p className="subtitle" style={{ margin: "10px 0 0" }}>{t("new.fileName")}: <code>90_pending/{slug}.md</code></p>}
      </div>

      <div className="form-card">
        <label>{t("new.bodyLabel")}</label>
        <div className="btn-row" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={draft} disabled={!title.trim() || busy !== ""}>
            {busy === "draft" ? t("new.drafting") : t("new.draft")}
          </button>
          <button className="btn" onClick={() => setBody(BODY_TEMPLATES[type].trim())} disabled={busy !== ""}>
            {t("new.blank")}
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
          {busy === "commit" ? t("new.submitting") : t("new.submitPr")}
        </button>
        <button className="btn" onClick={download} disabled={!ready}>{t("new.download")}</button>
        <button className="btn" onClick={() => navigator.clipboard.writeText(fullMarkdown())} disabled={!ready}>
          {t("new.copyMd")}
        </button>
      </div>
    </>
  );
}
