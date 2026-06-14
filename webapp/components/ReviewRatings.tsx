"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CardMeta, RatingAggregate, RatingEntry, TeamMember } from "@/lib/types";
import { cardMatchesDomain, domainLabel } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import DownloadButton from "./DownloadButton";

interface Scores {
  recommendation: number;
  innovation: number;
  rigor: number;
}

const DEFAULT_SCORES: Scores = { recommendation: 3, innovation: 3, rigor: 3 };

function RatingCard({
  card,
  reviewer,
  onSaved,
}: {
  card: CardMeta;
  reviewer: string;
  onSaved: (slug: string, rating: RatingAggregate, ratings: RatingEntry[]) => void;
}) {
  const { t } = useLang();
  const existing = card.ratings.find((item) => item.reviewer === reviewer);
  const [scores, setScores] = useState<Scores>(existing || DEFAULT_SCORES);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const current = card.ratings.find((item) => item.reviewer === reviewer);
    setScores(current || DEFAULT_SCORES);
  }, [card.ratings, reviewer]);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: card.slug, ...scores }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save rating.");
      onSaved(card.slug, data.rating, data.ratings);
      setMessage({ ok: true, text: t(data.demo ? "review.demoSaved" : "review.saved") });
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
            <span className="badge domain">{domainLabel(card.primary_domain)}</span>
            {card.tags.slice(0, 4).map((tag) => <span className="badge" key={tag}>#{tag}</span>)}
          </div>
        </div>
        <div className="weight-box">
          <strong>{card.rating?.weight ?? "—"}</strong>
          <span>{t("review.weight")}</span>
          <small>{card.rating ? `${card.rating.count} ${t("review.votes")}` : t("review.unrated")}</small>
        </div>
      </div>

      {card.rating && (
        <div className="rating-summary">
          <span>{t("review.recommendation")}: <b>{card.rating.recommendation}</b></span>
          <span>{t("review.innovation")}: <b>{card.rating.innovation}</b></span>
          <span>{t("review.rigor")}: <b>{card.rating.rigor}</b></span>
        </div>
      )}

      <div className="rating-inputs">
        {(["recommendation", "innovation", "rigor"] as const).map((key) => (
          <label key={key}>
            {t(`review.${key}`)}
            <select
              value={scores[key]}
              onChange={(event) => setScores((current) => ({ ...current, [key]: Number(event.target.value) }))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option value={value} key={value}>{value}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn primary" onClick={submit} disabled={busy}>
          {busy ? t("review.saving") : existing ? t("review.update") : t("review.submit")}
        </button>
        <Link className="btn" href={`/cards/${card.slug}#team-comments`}>
          {t("comments.open")} ({card.comments.length})
        </Link>
        {card.drive.length > 0 && <DownloadButton link={card.drive[0]} />}
      </div>
      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </section>
  );
}

export default function ReviewRatings({ cards: initialCards }: { cards: CardMeta[] }) {
  const { t } = useLang();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [cards, setCards] = useState(initialCards);
  const [view, setView] = useState<
    "queue" | "history" | "recommended" | "innovative" | "rigorous" | "disputed"
  >("queue");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMember(data.member);
      })
      .catch((reason) => setError(String(reason)));
  }, []);

  const queue = useMemo(() => {
    if (!member) return [];
    return cards.filter(
      (card) =>
        member.domains.some((domain) => cardMatchesDomain(card, domain)) &&
        !card.ratings.some((rating) => rating.reviewer === member.id),
    );
  }, [cards, member]);
  const history = useMemo(() => {
    if (!member) return [];
    return cards.filter((card) => card.ratings.some((rating) => rating.reviewer === member.id));
  }, [cards, member]);
  const domainCards = useMemo(
    () => (
      member
        ? cards.filter((card) => member.domains.some((domain) => cardMatchesDomain(card, domain)))
        : []
    ),
    [cards, member],
  );
  const recommended = useMemo(
    () => domainCards
      .filter((card) => (card.rating?.recommendation || 0) >= 4)
      .sort((a, b) => (b.rating?.recommendation || 0) - (a.rating?.recommendation || 0)),
    [domainCards],
  );
  const innovative = useMemo(
    () => domainCards
      .filter((card) => (card.rating?.innovation || 0) >= 4)
      .sort((a, b) => (b.rating?.innovation || 0) - (a.rating?.innovation || 0)),
    [domainCards],
  );
  const rigorous = useMemo(
    () => domainCards
      .filter((card) => (card.rating?.rigor || 0) >= 4)
      .sort((a, b) => (b.rating?.rigor || 0) - (a.rating?.rigor || 0)),
    [domainCards],
  );
  const disputed = useMemo(
    () => domainCards.filter((card) =>
      (["recommendation", "innovation", "rigor"] as const).some((key) => {
        const values = card.ratings.map((rating) => rating[key]);
        return values.length > 1 && Math.max(...values) - Math.min(...values) >= 2;
      }),
    ),
    [domainCards],
  );

  const onSaved = (slug: string, rating: RatingAggregate, ratings: RatingEntry[]) => {
    setCards((current) => current.map((card) => card.slug === slug ? { ...card, rating, ratings } : card));
    setView("history");
  };

  if (error) return <div className="notice warn">{error}</div>;
  if (!member) return <p className="subtitle">{t("review.loading")}</p>;
  if (!member.domains.length) {
    return (
      <div className="notice warn">
        {t("review.noDomains")} <Link href="/settings">{t("review.openSettings")}</Link>
      </div>
    );
  }

  const views = {
    queue,
    history,
    recommended,
    innovative,
    rigorous,
    disputed,
  };
  const shown = views[view];
  return (
    <>
      <div className="review-profile">
        <b>{member.name}</b>
        <span>{member.domains.map(domainLabel).join(" · ")}</span>
        <Link href="/settings">{t("review.editDomains")}</Link>
      </div>
      <div className="review-tabs">
        <button className={view === "queue" ? "active" : ""} onClick={() => setView("queue")}>
          {t("review.queue")} ({queue.length})
        </button>
        <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>
          {t("review.history")} ({history.length})
        </button>
        <button className={view === "recommended" ? "active" : ""} onClick={() => setView("recommended")}>
          {t("review.recommended")} ({recommended.length})
        </button>
        <button className={view === "innovative" ? "active" : ""} onClick={() => setView("innovative")}>
          {t("review.innovative")} ({innovative.length})
        </button>
        <button className={view === "rigorous" ? "active" : ""} onClick={() => setView("rigorous")}>
          {t("review.rigorous")} ({rigorous.length})
        </button>
        <button className={view === "disputed" ? "active" : ""} onClick={() => setView("disputed")}>
          {t("review.disputed")} ({disputed.length})
        </button>
      </div>
      <div className="rating-list">
        {shown.map((card) => (
          <RatingCard card={card} reviewer={member.id} onSaved={onSaved} key={card.slug} />
        ))}
      </div>
      {!shown.length && (
        <p className="subtitle">
          {view === "queue"
            ? t("review.queueEmpty")
            : view === "history"
              ? t("review.historyEmpty")
              : t("review.viewEmpty")}
        </p>
      )}
    </>
  );
}
