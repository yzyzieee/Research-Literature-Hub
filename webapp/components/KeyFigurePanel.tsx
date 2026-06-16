"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { driveFileId, uploadKeyFigureToDrive } from "@/lib/drive";
import { EMPTY_KEY_FIGURE } from "@/lib/key-figure";
import { canvasCropBlob, loadPdfDoc, pdfPageCount, renderDocPage, type PdfDoc } from "@/lib/pdf";
import {
  KEY_FIGURE_ROLES,
  type KeyFigure,
  type KeyFigureCandidate,
  type KeyFigureRole,
} from "@/lib/types";
import { useLang } from "@/lib/i18n";

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  slug: string;
  initialFigure: KeyFigure;
  candidates?: KeyFigureCandidate[];
  pdfFile?: File | null;
  pdfLink?: string;
  canCache?: boolean;
  persist?: boolean;
  onChange?: (figure: KeyFigure) => void;
}

function cleanFigureId(value: string): string {
  return value.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "figure";
}

export default function KeyFigurePanel({
  slug,
  initialFigure,
  candidates = [],
  pdfFile = null,
  pdfLink = "",
  canCache = true,
  persist = false,
  onChange,
}: Props) {
  const { t } = useLang();
  const [figure, setFigure] = useState(initialFigure);
  const [editing, setEditing] = useState(!persist && initialFigure.status !== "cached");
  const [page, setPage] = useState(initialFigure.page || 1);
  const [pageCount, setPageCount] = useState(0);
  const [rendered, setRendered] = useState(false);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState("");
  const [imageBroken, setImageBroken] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevThumbRef = useRef<HTMLCanvasElement>(null);
  const nextThumbRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const customRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const renderSeq = useRef(0);
  // The page the canvas should show — driven by the AI-suggested figure. Kept in a
  // ref so the doc-load effect renders the latest target even if the suggestion
  // arrives after the document has already loaded.
  const desiredPageRef = useRef(initialFigure.page || 1);

  // A stable identity for the PDF source so we reload the doc only when it changes.
  const sourceKey = pdfFile ? `file:${pdfFile.name}:${pdfFile.size}` : pdfLink ? `link:${pdfLink}` : "";

  const source = () => {
    if (pdfFile) return pdfFile;
    const id = driveFileId(pdfLink);
    return id ? `/api/drive/file?id=${encodeURIComponent(id)}` : "";
  };

  useEffect(() => {
    setFigure(initialFigure);
    setEditing(!persist && initialFigure.status !== "cached");
    // Only navigate when the target page genuinely changes (a new AI suggestion),
    // not on every field edit echoed back through onChange — otherwise editing a
    // field would snap the preview away from the page the user navigated to.
    const target = initialFigure.page || 1;
    if (target !== desiredPageRef.current) {
      desiredPageRef.current = target;
      setPage(target);
      const doc = docRef.current;
      if (doc && !customFile) {
        renderAll(doc, Math.min(Math.max(target, 1), pdfPageCount(doc))).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFigure, persist]);

  useEffect(() => () => {
    if (customPreview.startsWith("blob:")) URL.revokeObjectURL(customPreview);
  }, [customPreview]);

  const renderAll = async (doc: PdfDoc, target: number) => {
    const seq = ++renderSeq.current;
    const main = canvasRef.current;
    if (!main) return;
    await renderDocPage(doc, target, main, 1400);
    if (seq !== renderSeq.current) return;
    setCrop(null);
    setRendered(true);
    const count = pdfPageCount(doc);
    if (prevThumbRef.current) {
      if (target > 1) await renderDocPage(doc, target - 1, prevThumbRef.current, 240);
      else prevThumbRef.current.getContext("2d")?.clearRect(0, 0, prevThumbRef.current.width, prevThumbRef.current.height);
    }
    if (nextThumbRef.current) {
      if (target < count) await renderDocPage(doc, target + 1, nextThumbRef.current, 240);
      else nextThumbRef.current.getContext("2d")?.clearRect(0, 0, nextThumbRef.current.width, nextThumbRef.current.height);
    }
  };

  // Load the document once when entering PDF mode, then render the current page.
  useEffect(() => {
    if (!editing || customFile || !sourceKey) return;
    const value = source();
    if (!value) return;
    let cancelled = false;
    setLoadingDoc(true);
    setMessage(null);
    loadPdfDoc(value)
      .then(async (doc) => {
        if (cancelled) return;
        docRef.current = doc;
        const count = pdfPageCount(doc);
        setPageCount(count);
        const safe = Math.min(Math.max(desiredPageRef.current, 1), count);
        setPage(safe);
        await renderAll(doc, safe);
        if (!cancelled) setMessage({ ok: true, text: t("figure.dragHint") });
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage({
            ok: false,
            text: `${t("figure.renderFailed")}: ${error instanceof Error ? error.message : error}`,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDoc(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, sourceKey, customFile]);

  const updateLocal = (next: KeyFigure) => {
    setFigure(next);
    onChange?.(next);
  };

  const goToPage = (target: number) => {
    const doc = docRef.current;
    if (!doc) return;
    const count = pdfPageCount(doc);
    const safe = Math.min(Math.max(target, 1), count);
    if (safe === page && rendered) return;
    setPage(safe);
    renderAll(doc, safe).catch(() => {});
  };

  // The submitter switches figures here: pick one and its number, type,
  // description and page all follow, so image and text always correspond.
  const candidateKey = (c: KeyFigureCandidate) => `${c.figure_id ?? ""}|${c.page ?? ""}`;
  const selectedCandidate = candidates.findIndex(
    (c) => candidateKey(c) === `${figure.figure_id ?? ""}|${figure.page ?? ""}`,
  );

  const selectCandidate = (index: number) => {
    const choice = candidates[index];
    if (!choice) return;
    updateLocal({
      ...figure,
      figure_id: choice.figure_id,
      role: choice.role ?? figure.role,
      caption: choice.caption,
      reason: choice.reason,
      page: choice.page ?? figure.page,
    });
    if (choice.page) goToPage(choice.page);
  };

  const patchCard = async (next: KeyFigure) => {
    if (!persist) {
      updateLocal(next);
      return { demo: false };
    }
    const response = await fetch(`/api/cards/${encodeURIComponent(slug)}/key-figure`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key_figure: next }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t("figure.saveFailed"));
    updateLocal(data.key_figure || next);
    return data as { demo?: boolean };
  };

  const pointerPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(event.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(event.clientY - rect.top, rect.height)),
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!rendered || customFile) return;
    const position = pointerPosition(event);
    if (!position) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = position;
    setCrop({ ...position, width: 0, height: 0 });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    const position = pointerPosition(event);
    if (!start || !position) return;
    setCrop({
      x: Math.min(start.x, position.x),
      y: Math.min(start.y, position.y),
      width: Math.abs(position.x - start.x),
      height: Math.abs(position.y - start.y),
    });
  };

  const onPointerUp = () => {
    startRef.current = null;
  };

  const onCustomImage = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setMessage({ ok: false, text: t("figure.imageType") });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setMessage({ ok: false, text: t("figure.imageSize") });
      return;
    }
    if (customPreview.startsWith("blob:")) URL.revokeObjectURL(customPreview);
    setCustomFile(file);
    setCustomPreview(URL.createObjectURL(file));
    setRendered(false);
    setCrop(null);
    setMessage(null);
  };

  const confirmFigure = async () => {
    if (!canCache || !slug) return;
    setBusy(true);
    setProgress(0);
    setMessage(null);
    const oldRef = figure.status === "cached" ? figure.image_ref : null;
    let newRef = "";
    try {
      let image: File | Blob;
      if (customFile) {
        image = customFile;
      } else {
        const canvas = canvasRef.current;
        if (!canvas || !rendered) throw new Error(t("figure.previewFirst"));
        image = await canvasCropBlob(canvas, crop);
      }
      const figureId = cleanFigureId(figure.figure_id || `page-${page}`);
      const uploaded = await uploadKeyFigureToDrive(image, slug, figureId, setProgress);
      newRef = uploaded.id;
      const next: KeyFigure = {
        ...figure,
        status: "cached",
        figure_id: figure.figure_id || `Page ${page}`,
        page: customFile ? figure.page : page,
        role: figure.role || "method_overview",
        image_ref: uploaded.id,
        image_private: true,
      };
      const result = await patchCard(next);
      setEditing(false);
      setImageBroken(false);
      setMessage({
        ok: true,
        text: t(result.demo ? "figure.savedDemo" : persist ? "figure.savedCard" : "figure.savedDraft"),
      });
      if (oldRef && oldRef !== uploaded.id && !result.demo) {
        fetch("/api/drive/file", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: oldRef }),
        }).catch(() => {});
      }
    } catch (error) {
      if (newRef) {
        fetch("/api/drive/file", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: newRef }),
        }).catch(() => {});
      }
      setMessage({
        ok: false,
        text: `${t("figure.saveFailed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const removeFigure = async () => {
    setBusy(true);
    setMessage(null);
    const oldRef = figure.image_ref;
    try {
      const result = await patchCard({ ...EMPTY_KEY_FIGURE });
      setEditing(true);
      setRendered(false);
      setCrop(null);
      setCustomFile(null);
      setCustomPreview("");
      setMessage({
        ok: true,
        text: t(result.demo ? "figure.removedDemo" : "figure.removed"),
      });
      if (oldRef && !result.demo) {
        fetch("/api/drive/file", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: oldRef }),
        }).catch(() => {});
      }
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("figure.removeFailed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const useCanvasMode = () => {
    if (customPreview.startsWith("blob:")) URL.revokeObjectURL(customPreview);
    setCustomFile(null);
    setCustomPreview("");
    setCrop(null);
  };

  const imageSrc =
    customPreview ||
    (figure.status === "cached" && figure.image_ref
      ? `/api/drive/file?id=${encodeURIComponent(figure.image_ref)}`
      : "");

  useEffect(() => {
    if (!focusOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusOpen]);

  return (
    <section className="key-figure-panel">
      <div className="key-figure-heading">
        <div>
          <div className="key-figure-title-row">
            <h2>{t("figure.title")}</h2>
            <span className={`badge figure-status ${figure.status}`}>{t(`figure.status.${figure.status}`)}</span>
          </div>
          <p className="subtitle">{t("figure.subtitle")}</p>
        </div>
        {figure.status === "cached" && !editing && (
          <div className="btn-row key-figure-actions">
            <button className="btn" onClick={() => setEditing(true)} disabled={busy}>
              {t("figure.edit")}
            </button>
          </div>
        )}
        {figure.status !== "cached" && !editing && (
          <button className="btn" onClick={() => setEditing(true)} disabled={busy}>
            {figure.status === "suggested" ? t("figure.reviewSuggestion") : t("figure.add")}
          </button>
        )}
      </div>

      {figure.status === "suggested" && !editing && figure.reason && (
        <div className="key-figure-suggestion">
          <div className="meta-row">
            {figure.role && <span className="badge type">{figure.role.replaceAll("_", " ")}</span>}
            {figure.figure_id && <span className="badge">{figure.figure_id}</span>}
            {figure.page && <span className="badge">{t("figure.page")} {figure.page}</span>}
          </div>
          <p>{figure.reason}</p>
        </div>
      )}

      {figure.status === "cached" && !editing && (
        <div className="key-figure-display">
          {!imageBroken ? (
            <button
              type="button"
              className="key-figure-image-button"
              onClick={() => setFocusOpen(true)}
              aria-label={t("figure.focus")}
            >
              <img
                src={imageSrc}
                alt={figure.caption || figure.figure_id || t("figure.title")}
                onError={() => setImageBroken(true)}
              />
              <span className="key-figure-focus-icon" aria-hidden="true">⛶</span>
            </button>
          ) : (
            <div className="notice warn">{t("figure.missingImage")}</div>
          )}
          <div className="key-figure-copy">
            <div className="meta-row">
              {figure.role && <span className="badge type">{figure.role.replaceAll("_", " ")}</span>}
              {figure.figure_id && <span className="badge">{figure.figure_id}</span>}
              {figure.page && <span className="badge">{t("figure.page")} {figure.page}</span>}
              {figure.image_private && <span className="badge private">{t("figure.private")}</span>}
            </div>
            {figure.caption && <p><strong>{figure.caption}</strong></p>}
            {figure.reason && <p className="subtitle">{figure.reason}</p>}
          </div>
        </div>
      )}

      {editing && (
        <div className="key-figure-editor">
          {figure.status === "suggested" && (
            <div className="notice ok">
              <b>{t("figure.aiSuggested")}</b>
              {figure.reason && <span> {figure.reason}</span>}
            </div>
          )}

          <div className="key-figure-fields">
            {/* Switch between AI-found figures: picking one fills the rest. */}
            {candidates.length > 0 && (
              <label className="figure-role-field">
                {t("figure.candidate")}
                <select
                  value={selectedCandidate >= 0 ? String(selectedCandidate) : ""}
                  onChange={(event) => {
                    if (event.target.value !== "") selectCandidate(Number(event.target.value));
                  }}
                >
                  <option value="">{t("figure.candidatePick")}</option>
                  {candidates.map((candidate, index) => (
                    <option value={index} key={candidateKey(candidate)}>
                      {[
                        candidate.figure_id,
                        candidate.page ? `${t("figure.page")} ${candidate.page}` : "",
                        candidate.role ? t(`figure.roleLabel.${candidate.role}`) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="figure-role-field">
              {t("figure.role")}
              <select
                value={figure.role || ""}
                onChange={(event) => updateLocal({
                  ...figure,
                  role: (event.target.value || null) as KeyFigureRole | null,
                })}
              >
                <option value="">{t("figure.rolePick")}</option>
                {KEY_FIGURE_ROLES.map((role) => (
                  <option value={role} key={role}>{t(`figure.roleLabel.${role}`)}</option>
                ))}
              </select>
            </label>

            <label className="figure-role-field">
              {t("figure.figureId")}
              <input
                type="text"
                value={figure.figure_id || ""}
                placeholder={t("figure.figureIdPh")}
                onChange={(event) => updateLocal({ ...figure, figure_id: event.target.value || null })}
              />
            </label>

            <label className="figure-role-field figure-caption-field">
              {t("figure.caption")}
              <textarea
                rows={2}
                value={figure.caption || ""}
                placeholder={t("figure.captionPh")}
                onChange={(event) => updateLocal({ ...figure, caption: event.target.value || null })}
              />
            </label>

            <p className="subtitle figure-edit-note">{t("figure.editNote")}</p>
          </div>

          <input
            ref={customRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event) => onCustomImage(event.target.files?.[0])}
          />

          {!customPreview && (
            <div className="figure-pager">
              <button
                className="btn"
                onClick={() => goToPage(page - 1)}
                disabled={loadingDoc || busy || page <= 1}
                aria-label={t("figure.prevPage")}
              >
                ‹ {t("figure.prevPage")}
              </button>
              <span className="figure-pager-status">
                {loadingDoc
                  ? t("figure.rendering")
                  : pageCount
                    ? `${t("figure.page")} ${page} / ${pageCount}`
                    : t("figure.noPdf")}
              </span>
              <button
                className="btn"
                onClick={() => goToPage(page + 1)}
                disabled={loadingDoc || busy || (pageCount > 0 && page >= pageCount)}
                aria-label={t("figure.nextPage")}
              >
                {t("figure.nextPage")} ›
              </button>
              <button className="btn" onClick={() => customRef.current?.click()} disabled={busy}>
                {t("figure.uploadImage")}
              </button>
            </div>
          )}
          {customPreview && (
            <div className="btn-row">
              <button className="btn" onClick={useCanvasMode} disabled={busy}>
                {t("figure.backToPdf")}
              </button>
            </div>
          )}

          {/* Presenter-mode view: prev thumb · current page · next thumb. */}
          {!customPreview && (
            <div className="figure-presenter">
              <button
                type="button"
                className="figure-thumb"
                onClick={() => goToPage(page - 1)}
                disabled={loadingDoc || page <= 1}
                aria-label={t("figure.prevPage")}
              >
                <canvas ref={prevThumbRef} />
              </button>
              <div
                className={`key-figure-crop ${!rendered ? "is-hidden" : ""}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <canvas ref={canvasRef} />
                {crop && (
                  <span
                    className="crop-selection"
                    style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }}
                  />
                )}
              </div>
              <button
                type="button"
                className="figure-thumb"
                onClick={() => goToPage(page + 1)}
                disabled={loadingDoc || (pageCount > 0 && page >= pageCount)}
                aria-label={t("figure.nextPage")}
              >
                <canvas ref={nextThumbRef} />
              </button>
            </div>
          )}

          {customPreview && (
            <div className="key-figure-crop custom">
              <img src={customPreview} alt={t("figure.customPreview")} />
            </div>
          )}

          {(rendered || customFile || (persist && figure.status === "cached")) && (
            <>
              {!canCache && <div className="notice warn">{t("figure.archiveFirst")}</div>}
              {busy && progress > 0 && (
                <div className="upload-progress" aria-label={`${progress}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="btn-row">
                {(rendered || customFile) && (
                  <button className="btn primary" onClick={confirmFigure} disabled={busy || !canCache}>
                    {busy && progress > 0 ? `${t("figure.caching")} ${progress}%` : t("figure.confirm")}
                  </button>
                )}
                {persist && figure.status === "cached" && (
                  <button
                    className="btn"
                    onClick={() => {
                      setFigure(initialFigure);
                      setPage(initialFigure.page || 1);
                      setRendered(false);
                      setCrop(null);
                      useCanvasMode();
                      setEditing(false);
                      setMessage(null);
                    }}
                    disabled={busy}
                  >
                    {t("figure.cancel")}
                  </button>
                )}
                {persist && figure.status === "cached" && (
                  <button className="btn danger" onClick={removeFigure} disabled={busy}>
                    {t("figure.remove")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {focusOpen && imageSrc && !imageBroken && (
        <div className="figure-focus-backdrop" role="dialog" aria-modal="true" onClick={() => setFocusOpen(false)}>
          <div className="figure-focus-view" onClick={(event) => event.stopPropagation()}>
            <button className="figure-focus-close" type="button" onClick={() => setFocusOpen(false)}>
              {t("figure.closeFocus")}
            </button>
            <img src={imageSrc} alt={figure.caption || figure.figure_id || t("figure.title")} />
            {(figure.caption || figure.reason) && (
              <div className="figure-focus-caption">
                {figure.caption && <strong>{figure.caption}</strong>}
                {figure.reason && <p>{figure.reason}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </section>
  );
}
