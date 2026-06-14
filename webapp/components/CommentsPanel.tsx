"use client";

import { useEffect, useState } from "react";
import type { CommentEntry } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const MAX_COMMENT_LENGTH = 4000;

export default function CommentsPanel({
  slug,
  initialComments,
}: {
  slug: string;
  initialComments: CommentEntry[];
}) {
  const { t } = useLang();
  const [comments, setComments] = useState(initialComments);
  const [viewer, setViewer] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<CommentEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/comment?slug=${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setComments(data.comments || []);
        setViewer(data.viewer || "");
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }));
  }, [slug]);

  const startEdit = (comment: CommentEntry) => {
    setEditing(comment);
    setDraft(comment.body);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft("");
    setMessage(null);
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, id: editing?.id, body: draft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("comments.failed"));
      setComments(data.comments || []);
      setDraft("");
      setEditing(null);
      setMessage({
        ok: true,
        text: t(data.demo ? "comments.demoSaved" : editing ? "comments.updated" : "comments.saved"),
      });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("comments.failed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="comments-panel" id="team-comments">
      <div className="comments-heading">
        <div>
          <h2>{t("comments.title")}</h2>
          <p className="subtitle">{t("comments.subtitle")}</p>
        </div>
        <span className="badge">{comments.length} {t("comments.count")}</span>
      </div>

      <div className="comment-list">
        {comments.map((comment) => (
          <article className="comment-item" key={comment.id}>
            <header>
              <strong>{comment.author}</strong>
              <time>{comment.updated || comment.created}</time>
              {comment.updated !== comment.created && <span>{t("comments.edited")}</span>}
            </header>
            <p>{comment.body}</p>
            {comment.author === viewer && (
              <button className="comment-edit" onClick={() => startEdit(comment)}>
                {t("comments.edit")}
              </button>
            )}
          </article>
        ))}
        {!comments.length && <p className="subtitle">{t("comments.empty")}</p>}
      </div>

      <div className="comment-compose">
        <label htmlFor="team-comment">
          {editing ? t("comments.editing") : t("comments.add")}
        </label>
        <textarea
          id="team-comment"
          rows={5}
          maxLength={MAX_COMMENT_LENGTH}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("comments.placeholder")}
        />
        <div className="comment-compose-meta">
          <span>{draft.length}/{MAX_COMMENT_LENGTH}</span>
          <div className="btn-row">
            {editing && <button className="btn" onClick={cancelEdit}>{t("comments.cancel")}</button>}
            <button className="btn primary" onClick={save} disabled={busy || draft.trim().length < 2}>
              {busy ? t("comments.saving") : editing ? t("comments.update") : t("comments.publish")}
            </button>
          </div>
        </div>
      </div>
      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </section>
  );
}
