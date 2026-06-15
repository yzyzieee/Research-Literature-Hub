"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CardDeletionRequest } from "@/lib/deletion-requests";
import { useLang } from "@/lib/i18n";

export default function DeletionRequestReview() {
  const { t } = useLang();
  const [requests, setRequests] = useState<CardDeletionRequest[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/deletion-requests")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRequests(data.requests || []);
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }));
  }, []);

  const review = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    setMessage(null);
    try {
      const response = await fetch("/api/deletion-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequests((current) =>
        current.map((request) => request.id === id ? data.request : request),
      );
      setMessage({
        ok: true,
        text: t(action === "approve"
          ? "deletionReview.approved"
          : "deletionReview.rejected"),
      });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("deletionReview.failed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  const pending = requests.filter((request) => request.status === "pending");

  return (
    <div className="form-card">
      <h2 style={{ marginTop: 0 }}>{t("deletionReview.title")}</h2>
      <p className="subtitle">{t("deletionReview.hint")}</p>
      <div className="domain-proposal-list">
        {pending.map((request) => (
          <article className="domain-proposal" key={request.id}>
            <div>
              <b>{request.title}</b>
              <p>{request.reason}</p>
              <span className="subtitle">
                {request.requested_by} · {request.requested_at.slice(0, 10)}
              </span>
              <div>
                <Link href={`/cards/${request.slug}`}>{t("deletionReview.open")}</Link>
              </div>
            </div>
            <div className="btn-row">
              <button
                className="btn danger"
                onClick={() => review(request.id, "approve")}
                disabled={busy !== ""}
              >
                {t("deletionReview.approve")}
              </button>
              <button
                className="btn"
                onClick={() => review(request.id, "reject")}
                disabled={busy !== ""}
              >
                {t("deletionReview.reject")}
              </button>
            </div>
          </article>
        ))}
        {!pending.length && <p className="subtitle">{t("deletionReview.empty")}</p>}
      </div>
      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </div>
  );
}
