"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CardMeta, RatingAggregate, RatingEntry } from "@/lib/types";
import { domainLabel } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import DownloadButton from "./DownloadButton";

interface Scores {
  recommendation: number;
  innovation: number;
  rigor: number;
}

const DEFAULT_SCORES: Scores = { recommendation: 3, innovation: 3, rigor: 3 };

function RatingCard({ card, reviewer }: { card: CardMeta; reviewer: string }) {
  const { t } = useLang();
  const [scores, setScores] = useState<Scores>(DEFAULT_SCORES);
  const [rating, setRating] = useState<RatingAggregate | null>(card.rating);
  const [ratings, setRatings] = useState<RatingEntry[]>(card.ratings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const existing = ratings.find(
      (item) => reviewer && item.reviewer.toLocaleLowerCase() === reviewer.toLocaleLowerCase(),
    );
    setScores(existing || DEFAULT_SCORES);
  }, [reviewer, ratings]);

  const setScore = (key: keyof Scores, value: string) => {
    setScores((current) => ({ ...current, [key]: Number(value) }));
  };

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: card.slug, reviewer, ...scores }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save rating.");
      setRating(data.rating);
      setRatings(data.ratings);
      setMessage({ ok: true, text: t("review.saved") });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("review.failed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rating-card">
      <div className="rating-card-head">
        <div>
          <Link href={`/cards/${card.slug}`} className="rating-title">{card.title}</Link>
          <div className="cite">
            {[card.authors[0], card.year].filter(Boolean).join(" · ")}
            {card.authors.length > 1 ? " et al." : ""}
          </div>
          <div className="meta-row">
            <span className="badge domain">{domainLabel(card.domain)}</span>
            {card.tags.slice(0, 4).map((tag) => <span className="badge" key={tag}>#{tag}</span>)}
          </div>
        </div>
        <div className="weight-box">
          <strong>{rating?.weight ?? "—"}</strong>
          <span>{t("review.weight")}</span>
          <small>{rating ? `${rating.count} ${t("review.votes")}` : t("review.unrated")}</small>
        </div>
      </div>

      {rating && (
        <div className="rating-summary">
          <span>{t("review.recommendation")}: <b>{rating.recommendation}</b></span>
          <span>{t("review.innovation")}: <b>{rating.innovation}</b></span>
          <span>{t("review.rigor")}: <b>{rating.rigor}</b></span>
        </div>
      )}

      <div className="rating-inputs">
        {(["recommendation", "innovation", "rigor"] as const).map((key) => (
          <label key={key}>
            {t(`review.${key}`)}
            <select value={scores[key]} onChange={(event) => setScore(key, event.target.value)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option value={value} key={value}>{value}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn primary" onClick={submit} disabled={busy || reviewer.trim().length < 2}>
          {busy ? t("review.saving") : t("review.submit")}
        </button>
        {card.drive.length > 0 && <DownloadButton link={card.drive[0]} />}
      </div>
      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </section>
  );
}

export default function ReviewRatings({ cards }: { cards: CardMeta[] }) {
  const { t } = useLang();
  const [reviewer, setReviewer] = useState("");

  useEffect(() => {
    setReviewer(localStorage.getItem("kb-reviewer") || "");
  }, []);

  const updateReviewer = (value: string) => {
    setReviewer(value);
    localStorage.setItem("kb-reviewer", value);
  };

  return (
    <>
      <div className="reviewer-box">
        <label htmlFor="reviewer-name">{t("review.name")}</label>
        <input
          id="reviewer-name"
          value={reviewer}
          onChange={(event) => updateReviewer(event.target.value)}
          placeholder={t("review.namePh")}
          maxLength={60}
        />
        <p className="subtitle">{t("review.nameHint")}</p>
      </div>
      <div className="rating-list">
        {cards.map((card) => <RatingCard card={card} reviewer={reviewer.trim()} key={card.slug} />)}
      </div>
      {!cards.length && <p className="subtitle">{t("review.empty")}</p>}
    </>
  );
}
