"use client";

import { useMemo, useState } from "react";
import type { ExportCardMeta } from "@/lib/types";
import {
  DOMAINS,
  PUBLICATION_TYPES,
  domainLabel,
  publicationTypeLabel,
} from "@/lib/types";
import {
  catalogUrls,
  compactCatalogPrompt,
  driveDownloadUrl,
  estimateTokens,
  libraryAccessPrompt,
  matchCardsFromText,
} from "@/lib/export";
import { useLang } from "@/lib/i18n";
import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";

type ExportMode = "access" | "compact" | "selected";
const MAX_FULL_PACK = 25;

export default function ExportBuilder({ cards, repo }: { cards: ExportCardMeta[]; repo?: string }) {
  const { t } = useLang();
  const [mode, setMode] = useState<ExportMode>("access");
  const [idea, setIdea] = useState("");
  const [domain, setDomain] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bundle, setBundle] = useState("");
  const [bundleTokens, setBundleTokens] = useState(0);
  const [bundleBusy, setBundleBusy] = useState(false);
  const [bundleError, setBundleError] = useState("");
  const [listText, setListText] = useState("");

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return cards.filter(
      (card) =>
        (!domain || card.domains.includes(domain)) &&
        (!publicationType || card.publication_type === publicationType) &&
        (!query ||
          card.title.toLowerCase().includes(query) ||
          card.citation_key.toLowerCase().includes(query) ||
          card.tags.some((tag) => tag.includes(query))),
    );
  }, [cards, domain, publicationType, filter]);

  const presentDomains = useMemo(
    () => DOMAINS.filter((item) => cards.some((card) => card.domains.includes(item))),
    [cards],
  );
  const presentPublicationTypes = useMemo(
    () => PUBLICATION_TYPES.filter((item) => cards.some((card) => card.publication_type === item)),
    [cards],
  );
  const accessPrompt = useMemo(() => libraryAccessPrompt(idea, repo), [idea, repo]);
  const compactPack = useMemo(
    () => compactCatalogPrompt(visible, idea, repo),
    [visible, idea, repo],
  );
  const compactTokens = useMemo(() => estimateTokens(compactPack), [compactPack]);
  const chosen = cards.filter((card) => selected.has(card.slug));
  const urls = catalogUrls(repo);

  const clearPreparedBundle = () => {
    setBundle("");
    setBundleTokens(0);
    setBundleError("");
  };

  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
    } else if (next.size < MAX_FULL_PACK) {
      next.add(slug);
    } else {
      setBundleError(t("export.limitError"));
      return;
    }
    setSelected(next);
    clearPreparedBundle();
  };

  const selectShown = () => {
    const next = new Set(selected);
    for (const card of visible) {
      if (next.size >= MAX_FULL_PACK) break;
      next.add(card.slug);
    }
    setSelected(next);
    clearPreparedBundle();
  };

  const prepareBundle = async () => {
    if (!selected.size) return;
    setBundleBusy(true);
    setBundleError("");
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: [...selected] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBundle(data.bundle);
      setBundleTokens(data.estimatedTokens);
    } catch (error) {
      setBundleError(error instanceof Error ? error.message : String(error));
    } finally {
      setBundleBusy(false);
    }
  };

  const downloadBundle = () => {
    const blob = new Blob([bundle], { type: "text/markdown;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `literature-full-pack-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const matched = useMemo(
    () => (listText.trim() ? matchCardsFromText(cards, listText) : []),
    [listText, cards],
  );
  const matchedLinks = matched
    .filter((card) => card.drive.length)
    .map((card) => driveDownloadUrl(card.drive[0]))
    .join("\n");

  const modeCards: Array<{ id: ExportMode; number: string; title: string; text: string }> = [
    { id: "access", number: "1", title: t("export.modeAccess"), text: t("export.modeAccessHint") },
    { id: "compact", number: "2", title: t("export.modeCompact"), text: t("export.modeCompactHint") },
    { id: "selected", number: "3", title: t("export.modeSelected"), text: t("export.modeSelectedHint") },
  ];

  return (
    <>
      <div className="llm-workflow">
        {modeCards.map((item) => (
          <button
            key={item.id}
            className={`llm-mode-card${mode === item.id ? " active" : ""}`}
            onClick={() => setMode(item.id)}
          >
            <span className="llm-mode-number">{item.number}</span>
            <span>
              <b>{item.title}</b>
              <small>{item.text}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="notice ok">{t("export.scaleHint")}</div>

      {mode === "access" && (
        <section className="form-card">
          <h2>{t("export.accessTitle")}</h2>
          <p className="subtitle">{t("export.accessHint")}</p>
          <label>{t("export.idea")}</label>
          <textarea
            rows={4}
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder={t("export.ideaPlaceholder")}
          />
          <div className="btn-row">
            <CopyButton text={accessPrompt} label={t("export.copyAccess")} primary />
            <a className="btn" href={urls.markdown} target="_blank" rel="noreferrer">
              {t("export.openMarkdown")}
            </a>
            <a className="btn" href={urls.json} target="_blank" rel="noreferrer">
              {t("export.openJson")}
            </a>
          </div>
          <label>{t("export.preview")}</label>
          <textarea rows={14} readOnly value={accessPrompt} />
        </section>
      )}

      {mode === "compact" && (
        <section className="form-card">
          <h2>{t("export.compactTitle")}</h2>
          <p className="subtitle">{t("export.compactHint")}</p>
          <label>{t("export.idea")}</label>
          <textarea
            rows={3}
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder={t("export.ideaPlaceholder")}
          />
          <div className="toolbar">
            <input
              type="search"
              placeholder={t("export.filter")}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <select value={domain} onChange={(event) => setDomain(event.target.value)}>
              <option value="">{t("export.allDomains")}</option>
              {presentDomains.map((item) => (
                <option key={item} value={item}>{domainLabel(item)}</option>
              ))}
            </select>
            <select
              value={publicationType}
              onChange={(event) => setPublicationType(event.target.value)}
            >
              <option value="">{t("cards.allPublicationTypes")}</option>
              {presentPublicationTypes.map((item) => (
                <option key={item} value={item}>{publicationTypeLabel(item)}</option>
              ))}
            </select>
          </div>
          <p className="subtitle">
            {visible.length} {t("export.catalogEntries")} · ~{compactTokens.toLocaleString()} tokens
          </p>
          {compactTokens > 50000 && <div className="notice warn">{t("export.largeCatalog")}</div>}
          <div className="btn-row">
            <CopyButton text={compactPack} label={t("export.copyCompact")} primary />
          </div>
          <label>{t("export.preview")}</label>
          <textarea rows={16} readOnly value={compactPack} />
        </section>
      )}

      {mode === "selected" && (
        <>
          <section className="form-card">
            <h2>{t("export.selectedTitle")}</h2>
            <p className="subtitle">{t("export.selectedHint")}</p>
            <div className="toolbar">
              <input
                type="search"
                placeholder={t("export.filter")}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
              <select value={domain} onChange={(event) => setDomain(event.target.value)}>
                <option value="">{t("export.allDomains")}</option>
                {presentDomains.map((item) => (
                  <option key={item} value={item}>{domainLabel(item)}</option>
                ))}
              </select>
              <select
                value={publicationType}
                onChange={(event) => setPublicationType(event.target.value)}
              >
                <option value="">{t("cards.allPublicationTypes")}</option>
                {presentPublicationTypes.map((item) => (
                  <option key={item} value={item}>{publicationTypeLabel(item)}</option>
                ))}
              </select>
              <button className="btn" onClick={selectShown}>{t("export.selectShown")}</button>
              <button
                className="btn"
                onClick={() => {
                  setSelected(new Set());
                  clearPreparedBundle();
                }}
              >
                {t("export.clear")}
              </button>
            </div>
            <p className="subtitle">
              {chosen.length} / {MAX_FULL_PACK} {t("export.selected")}
            </p>
          </section>

          <div className="card-grid" style={{ marginBottom: 20 }}>
            {visible.map((card) => (
              <label
                key={card.slug}
                className="card-item"
                style={{ display: "flex", gap: 12, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(card.slug)}
                  onChange={() => toggle(card.slug)}
                  style={{ width: "auto", marginTop: 4 }}
                />
                <span>
                  <span className="titles">{card.title}</span>
                  <span className="meta-row">
                    <span className="badge domain">{domainLabel(card.primary_domain)}</span>
                    {card.publication_type && (
                      <span className="badge type">{publicationTypeLabel(card.publication_type)}</span>
                    )}
                    {card.drive.length > 0 && <span className="badge">{t("export.hasFulltext")}</span>}
                    {card.comment_count > 0 && (
                      <span className="badge">{card.comment_count} {t("comments.count")}</span>
                    )}
                    {card.tags.map((tag) => <span key={tag} className="badge">#{tag}</span>)}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <section className="form-card">
            <div className="btn-row" style={{ marginTop: 0 }}>
              <button
                className="btn primary"
                onClick={prepareBundle}
                disabled={!selected.size || bundleBusy}
              >
                {bundleBusy ? t("export.preparing") : t("export.prepareFull")}
              </button>
              {bundle && <CopyButton text={bundle} label={t("export.copy")} />}
              {bundle && <button className="btn" onClick={downloadBundle}>{t("export.download")}</button>}
            </div>
            {bundleError && <div className="notice warn">{bundleError}</div>}
            {bundle && (
              <>
                <p className="subtitle">
                  {chosen.length} {t("export.selected")} · ~{bundleTokens.toLocaleString()} tokens
                </p>
                <label>{t("export.preview")}</label>
                <textarea rows={14} readOnly value={bundle} />
              </>
            )}
          </section>
        </>
      )}

      <h2 style={{ marginTop: 36 }}>{t("get.title")}</h2>
      <p className="subtitle">{t("get.subtitle")}</p>
      <div className="form-card">
        <textarea
          rows={5}
          placeholder={t("get.placeholder")}
          value={listText}
          onChange={(event) => setListText(event.target.value)}
        />
        {listText.trim() && (
          <>
            <p className="subtitle" style={{ margin: "12px 0 8px" }}>
              {matched.length} {t("get.matched")}
            </p>
            <div className="card-grid">
              {matched.map((card) => (
                <div
                  key={card.slug}
                  className="card-item"
                  style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}
                >
                  <span>
                    <span className="titles">{card.title}</span>
                    <span className="cite">{card.citation_key || card.slug}</span>
                  </span>
                  {card.drive.length > 0 ? (
                    <DownloadButton link={card.drive[0]} />
                  ) : (
                    <span className="badge">{t("get.noPdf")}</span>
                  )}
                </div>
              ))}
            </div>
            {matchedLinks && (
              <div className="btn-row">
                <CopyButton text={matchedLinks} label={t("get.copyLinks")} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
