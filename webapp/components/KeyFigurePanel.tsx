"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { driveFileId, uploadKeyFigureToDrive } from "@/lib/drive";
import { EMPTY_KEY_FIGURE } from "@/lib/key-figure";
import { canvasCropBlob, renderPdfPage } from "@/lib/pdf";
import {
  KEY_FIGURE_ROLES,
  type KeyFigure,
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
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFigure(initialFigure);
    setPage(initialFigure.page || 1);
    setEditing(!persist && initialFigure.status !== "cached");
  }, [initialFigure, persist]);

  useEffect(() => () => {
    if (customPreview.startsWith("blob:")) URL.revokeObjectURL(customPreview);
  }, [customPreview]);

  const updateLocal = (next: KeyFigure) => {
    setFigure(next);
    onChange?.(next);
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

  const source = () => {
    if (pdfFile) return pdfFile;
    const id = driveFileId(pdfLink);
    return id ? `/api/drive/file?id=${encodeURIComponent(id)}` : "";
  };

  const loadPage = async () => {
    const value = source();
    if (!value) {
      setMessage({ ok: false, text: t("figure.noPdf") });
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await renderPdfPage(value, page, canvas);
      const safePage = Math.min(Math.max(page, 1), result.pages);
      setPage(safePage);
      setPageCount(result.pages);
      setRendered(true);
      setCustomFile(null);
      setCustomPreview("");
      setCrop(null);
      setMessage({ ok: true, text: t("figure.dragHint") });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("figure.renderFailed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy(false);
    }
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

  const imageSrc =
    customPreview ||
    (figure.status === "cached" && figure.image_ref
      ? `/api/drive/file?id=${encodeURIComponent(figure.image_ref)}`
      : "");

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
          <div className="btn-row">
            <button className="btn" onClick={() => setEditing(true)} disabled={busy}>
              {t("figure.replace")}
            </button>
            <button className="btn danger" onClick={removeFigure} disabled={busy}>
              {t("figure.remove")}
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
            <img
              src={imageSrc}
              alt={figure.caption || figure.figure_id || t("figure.title")}
              onError={() => setImageBroken(true)}
            />
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
            <label>
              {t("figure.figureId")}
              <input
                value={figure.figure_id || ""}
                onChange={(event) => updateLocal({ ...figure, figure_id: event.target.value || null })}
                placeholder="Figure 2"
              />
            </label>
            <label>
              {t("figure.page")}
              <input
                type="number"
                min={1}
                max={pageCount || undefined}
                value={page}
                onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))}
              />
            </label>
            <label>
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
                  <option value={role} key={role}>{role.replaceAll("_", " ")}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            {t("figure.caption")}
            <textarea
              rows={2}
              value={figure.caption || ""}
              onChange={(event) => updateLocal({ ...figure, caption: event.target.value || null })}
            />
          </label>
          <label>
            {t("figure.reason")}
            <textarea
              rows={2}
              value={figure.reason || ""}
              onChange={(event) => updateLocal({ ...figure, reason: event.target.value || null })}
            />
          </label>

          <input
            ref={customRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event) => onCustomImage(event.target.files?.[0])}
          />
          <div className="btn-row">
            <button className="btn" onClick={loadPage} disabled={busy || !source()}>
              {busy && !progress ? t("figure.rendering") : t("figure.loadPage")}
            </button>
            <button className="btn" onClick={() => customRef.current?.click()} disabled={busy}>
              {t("figure.uploadImage")}
            </button>
            {(rendered || customFile) && (
              <button
                className="btn"
                onClick={() => {
                  setCrop(null);
                  setCustomFile(null);
                  setCustomPreview("");
                }}
                disabled={busy}
              >
                {t("figure.resetSelection")}
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
                  setCustomFile(null);
                  setCustomPreview("");
                  setEditing(false);
                  setMessage(null);
                }}
                disabled={busy}
              >
                {t("figure.cancel")}
              </button>
            )}
          </div>

          <div
            className={`key-figure-crop ${customPreview ? "custom" : ""} ${
              !rendered && !customPreview ? "is-hidden" : ""
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {customPreview && <img src={customPreview} alt={t("figure.customPreview")} />}
            <canvas ref={canvasRef} className={customPreview ? "hidden" : ""} />
            {crop && !customPreview && (
              <span
                className="crop-selection"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                }}
              />
            )}
          </div>
          {(rendered || customFile) && (
            <>
              {!canCache && <div className="notice warn">{t("figure.archiveFirst")}</div>}
              {busy && progress > 0 && (
                <div className="upload-progress" aria-label={`${progress}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              )}
              <button className="btn primary" onClick={confirmFigure} disabled={busy || !canCache}>
                {busy && progress > 0
                  ? `${t("figure.caching")} ${progress}%`
                  : t("figure.confirm")}
              </button>
            </>
          )}
        </div>
      )}

      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </section>
  );
}
