"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

export default function CardEditor({ slug }: { slug: string }) {
  const { t } = useLang();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/cards/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setContent(data.content || "");
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }))
      .finally(() => setLoading(false));
  }, [slug]);

  const save = async () => {
    setBusy(true);
    setSaved(false);
    setMessage(null);
    try {
      const response = await fetch(`/api/cards/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("edit.failed"));
      setSaved(true);
      setMessage({
        ok: true,
        text: t(data.demo ? "edit.demoSaved" : "edit.saved"),
      });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("edit.failed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="subtitle">{t("edit.loading")}</p>;

  return (
    <div className="form-card card-editor">
      <div className="editor-guidance">
        <b>{t("edit.sharedTitle")}</b>
        <p>{t("edit.sharedHint")}</p>
      </div>
      <label htmlFor="card-markdown">{t("edit.markdown")}</label>
      <textarea
        id="card-markdown"
        rows={34}
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          setSaved(false);
        }}
        spellCheck={false}
      />
      <div className="btn-row">
        <button
          className="btn primary"
          onClick={save}
          disabled={busy || saved || content.length < 100}
        >
          {busy ? t("edit.saving") : saved ? t("edit.savedButton") : t("edit.save")}
        </button>
        <Link className="btn" href={`/cards/${slug}`}>{t("edit.cancel")}</Link>
      </div>
      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </div>
  );
}
