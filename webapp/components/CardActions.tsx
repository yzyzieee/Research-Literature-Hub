"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CardDeletionRequest } from "@/lib/deletion-requests";
import type { TeamMember } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export default function CardActions({
  slug,
  creator,
  repo,
}: {
  slug: string;
  creator: string;
  repo?: string;
}) {
  const { t } = useLang();
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [requests, setRequests] = useState<CardDeletionRequest[]>([]);
  const [reason, setReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"" | "delete" | "request">("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMember(data.member as TeamMember);
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }));

    fetch(`/api/deletion-requests?slug=${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRequests((data.requests || []) as CardDeletionRequest[]);
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }));
  }, [slug]);

  const canDelete = Boolean(
    member &&
    (member.role === "admin" || creator.toUpperCase() === member.id.toUpperCase()),
  );
  const pending = useMemo(
    () => requests.find((request) => request.status === "pending"),
    [requests],
  );

  const deleteCard = async () => {
    setBusy("delete");
    setMessage(null);
    try {
      const response = await fetch(`/api/cards/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("cardActions.deleteFailed"));
      setMessage({
        ok: true,
        text: t(data.demo ? "cardActions.deleteDemo" : "cardActions.deleted"),
      });
      setTimeout(() => router.push("/cards"), 900);
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("cardActions.deleteFailed")}: ${error instanceof Error ? error.message : error}`,
      });
      setBusy("");
    }
  };

  const requestDeletion = async () => {
    setBusy("request");
    setMessage(null);
    try {
      const response = await fetch("/api/deletion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("cardActions.requestFailed"));
      setRequests((current) => [...current, data.request]);
      setReason("");
      setMessage({
        ok: true,
        text: t(data.demo ? "cardActions.requestDemo" : "cardActions.requested"),
      });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("cardActions.requestFailed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="card-actions">
      <div className="btn-row">
        <Link className="btn" href={`/cards/${slug}/edit`}>{t("cardActions.edit")}</Link>
        {repo && (
          <a
            className="btn"
            href={`https://github.com/${repo}/blob/main/official/${slug}.md`}
            target="_blank"
            rel="noreferrer"
          >
            {t("cardActions.source")}
          </a>
        )}
        {canDelete && !confirmDelete && (
          <button className="btn danger" onClick={() => setConfirmDelete(true)}>
            {t("cardActions.delete")}
          </button>
        )}
      </div>

      {canDelete && confirmDelete && (
        <div className="destructive-panel">
          <b>{t("cardActions.confirmTitle")}</b>
          <p>{t("cardActions.confirmHint")}</p>
          <div className="btn-row">
            <button className="btn danger" onClick={deleteCard} disabled={busy !== ""}>
              {busy === "delete" ? t("cardActions.deleting") : t("cardActions.confirm")}
            </button>
            <button className="btn" onClick={() => setConfirmDelete(false)} disabled={busy !== ""}>
              {t("cardActions.cancel")}
            </button>
          </div>
        </div>
      )}

      {member && !canDelete && (
        <div className="deletion-request-panel">
          <b>{t("cardActions.requestTitle")}</b>
          {pending ? (
            <p className="subtitle">
              {t("cardActions.pending")} · {pending.reason}
            </p>
          ) : (
            <>
              <p className="subtitle">{t("cardActions.requestHint")}</p>
              <textarea
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("cardActions.reasonPlaceholder")}
              />
              <div className="btn-row">
                <button
                  className="btn danger"
                  onClick={requestDeletion}
                  disabled={busy !== "" || reason.trim().length < 5}
                >
                  {busy === "request" ? t("cardActions.requesting") : t("cardActions.request")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </div>
  );
}
