"use client";

import { useEffect, useRef, useState } from "react";
import { LITERATURE_BODY_TEMPLATE } from "@/lib/templates";
import {
  DOMAINS,
  DOMAIN_LABELS,
  PUBLICATION_TYPES,
  PUBLICATION_TYPE_LABELS,
  type KeyFigure,
  type KeyReference,
} from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { extractPdfText } from "@/lib/pdf";
import { uploadToDrive } from "@/lib/drive";
import { EMPTY_KEY_FIGURE } from "@/lib/key-figure";
import KeyFigurePanel from "@/components/KeyFigurePanel";

function yamlList(items: string[]): string {
  return items.length ? `[${items.map((item) => JSON.stringify(item)).join(", ")}]` : "[]";
}

type BusyAction =
  | ""
  | "doi"
  | "draft"
  | "commit"
  | "extract"
  | "drive"
  | "original"
  | "delete"
  | "domain";

interface ExtractedLiterature {
  primary_domain?: string;
  domains?: string[];
  publication_type?: string;
  title?: string;
  authors?: string[];
  year?: number | null;
  venue?: string;
  doi?: string;
  abstract?: string;
  citation_key?: string;
  key_references?: KeyReference[];
  key_figure?: KeyFigure;
  tags?: string[];
  suggested_domain?: string;
  suggested_domain_label?: string;
  domain_suggestion_reason?: string;
  body?: string;
}

interface DuplicateCandidate {
  slug: string;
  title: string;
  authors: string[];
  year: number | null;
  doi: string;
  citation_key: string;
  summary: string;
  card_url: string;
  drive: string[];
  reasons: string[];
  score: number;
}

type DuplicateDecision = "" | "clear" | "duplicate" | "different";

export default function NewLiteratureWizard() {
  const { t } = useLang();
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [publicationType, setPublicationType] = useState("journal-paper");
  const [title, setTitle] = useState("");
  const [doi, setDoi] = useState("");
  const [venue, setVenue] = useState("");
  const [abstract, setAbstract] = useState("");
  const [citationKey, setCitationKey] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [tags, setTags] = useState("");
  const [keyReferences, setKeyReferences] = useState<KeyReference[]>([]);
  const [keyFigure, setKeyFigure] = useState<KeyFigure>({ ...EMPTY_KEY_FIGURE });
  const [drive, setDrive] = useState("");
  const [notes, setNotes] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<BusyAction>("");
  const [pdfName, setPdfName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [archived, setArchived] = useState<{
    id: string;
    name: string;
    link: string;
    reused: boolean;
    uploadedBy: string;
    uploadedAt: string;
    signature: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState("");
  const [guest, setGuest] = useState(false);
  const [duplicateBusy, setDuplicateBusy] = useState(false);
  const [duplicateReview, setDuplicateReview] = useState<{
    signature: string;
    candidates: DuplicateCandidate[];
    decision: DuplicateDecision;
    selectedSlug?: string;
  } | null>(null);
  const [domainSuggestion, setDomainSuggestion] = useState<{
    id: string;
    label: string;
    reason: string;
  } | null>(null);
  const [domainProposalSent, setDomainProposalSent] = useState(false);
  const [archiveDeleteArmed, setArchiveDeleteArmed] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "warn"; text: string; link?: string } | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [published, setPublished] = useState<{ slug: string; url: string; demo: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const driveFolder = process.env.NEXT_PUBLIC_DRIVE_FOLDER_URL;
  const driveUploadEnabled = process.env.NEXT_PUBLIC_DRIVE_UPLOAD === "1";

  useEffect(() => {
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        setCurrentUser(data?.member?.name || "");
        setGuest(Boolean(data?.demo));
      })
      .catch(() => {});
  }, []);

  const slug = citationKey.trim();
  const authorList = authors.split(/[;,]/).map((author) => author.trim()).filter(Boolean);
  const tagList = tags
    .split(/[,\s\uFF0C]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);
  const driveList = drive.split(/\s+/).map((link) => link.trim()).filter(Boolean);
  const citationKeyValid = /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug);
  const duplicateSignature = JSON.stringify([
    title.trim().toLowerCase(),
    doi.trim().toLowerCase(),
    citationKey.trim().toLowerCase(),
    authorList[0]?.toLowerCase() || "",
    Number(year) || null,
  ]);
  const duplicateReviewCurrent = duplicateReview?.signature === duplicateSignature;
  const duplicateResolved = Boolean(
    duplicateReviewCurrent &&
      (duplicateReview?.decision === "clear" || duplicateReview?.decision === "different"),
  );
  const duplicateConfirmed = Boolean(
    duplicateReviewCurrent && duplicateReview?.decision === "duplicate",
  );
  const missingRequirements = [
    !primaryDomain ? t("new.missingPrimaryDomain") : "",
    !domains.length || !domains.includes(primaryDomain) ? t("new.missingDomains") : "",
    !title.trim() ? t("new.missingTitle") : "",
    !publicationType ? t("new.missingPublicationType") : "",
    !authorList.length ? t("new.missingAuthors") : "",
    !Number(year) ? t("new.missingYear") : "",
    !tagList.length ? t("new.missingTags") : "",
    !citationKeyValid ? t("new.missingCitationKey") : "",
  ].filter(Boolean);
  const ready = missingRequirements.length === 0;
  const archiveSignature = `${slug}:${doi.trim().toLowerCase()}`;
  const archiveCurrent = Boolean(
    archived &&
      archived.signature === archiveSignature &&
      driveList.includes(archived.link),
  );
  const needsArchive = Boolean(pdfFile && driveUploadEnabled);
  const submissionErrors = [
    ...missingRequirements,
    ready && duplicateConfirmed
      ? t("new.duplicateStop")
      : ready && !duplicateResolved
        ? t("new.missingDuplicateReview")
        : "",
    needsArchive && !archiveCurrent ? t("new.missingArchive") : "",
  ].filter(Boolean);

  const checkDuplicates = async (overrides?: {
    title?: string;
    doi?: string;
    citationKey?: string;
    authors?: string[];
    year?: number | null;
  }) => {
    const query = {
      title: overrides?.title ?? title,
      doi: overrides?.doi ?? doi,
      citation_key: overrides?.citationKey ?? citationKey,
      authors: overrides?.authors ?? authorList,
      year: overrides?.year ?? (year ? Number(year) : null),
    };
    const signature = JSON.stringify([
      String(query.title || "").trim().toLowerCase(),
      String(query.doi || "").trim().toLowerCase(),
      String(query.citation_key || "").trim().toLowerCase(),
      String(query.authors?.[0] || "").trim().toLowerCase(),
      Number(query.year) || null,
    ]);
    setDuplicateBusy(true);
    try {
      const response = await fetch("/api/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const candidates = (data.candidates || []) as DuplicateCandidate[];
      setDuplicateReview({
        signature,
        candidates,
        decision: candidates.length ? "" : "clear",
      });
      return candidates;
    } finally {
      setDuplicateBusy(false);
    }
  };

  const fullMarkdown = () => {
    const today = new Date().toISOString().slice(0, 10);
    const frontmatter = [
      "---",
      `title: ${JSON.stringify(title)}`,
      "entry_type: literature",
      `publication_type: ${publicationType}`,
      `primary_domain: ${primaryDomain}`,
      `domains: ${yamlList(domains)}`,
      `venue: ${JSON.stringify(venue)}`,
      `doi: ${JSON.stringify(doi)}`,
      `abstract: ${JSON.stringify(abstract)}`,
      "status: official",
      `citation_key: ${citationKey.trim()}`,
      `authors: ${yamlList(authorList)}`,
      `year: ${year || "null"}`,
      `tags: ${yamlList(tagList)}`,
      `key_references: ${JSON.stringify(keyReferences)}`,
      `key_figure: ${JSON.stringify(keyFigure)}`,
      `drive: ${yamlList(driveList)}`,
      "related: []",
      `created: ${today}`,
      "reviewed_by: []",
      "rating: null",
      "ratings: []",
      "comments: []",
      "---",
      "",
    ].join("\n");
    return frontmatter + (body.trim() || LITERATURE_BODY_TEMPLATE.trim()) + "\n";
  };

  const applyLiterature = (data: ExtractedLiterature, preserveArchiveIdentity = false) => {
    if (!preserveArchiveIdentity) {
      const extractedPrimary =
        data.primary_domain && DOMAINS.includes(data.primary_domain) ? data.primary_domain : "";
      const extractedDomains = (data.domains || []).filter((item) => DOMAINS.includes(item));
      if (extractedPrimary) {
        setPrimaryDomain(extractedPrimary);
        setDomains(Array.from(new Set([extractedPrimary, ...extractedDomains])));
      }
      if (data.publication_type && PUBLICATION_TYPES.includes(data.publication_type as never)) {
        setPublicationType(data.publication_type);
      }
      setTitle(data.title || "");
      setAuthors((data.authors || []).join(", "));
      setYear(data.year ? String(data.year) : "");
      setCitationKey(data.citation_key || "");
    }
    setVenue(data.venue || venue);
    setDoi(data.doi || doi);
    setAbstract(data.abstract || "");
    setTags((data.tags || []).join(", "));
    setKeyReferences(Array.isArray(data.key_references) ? data.key_references.slice(0, 8) : []);
    setKeyFigure((current) =>
      current.status === "cached" ? current : data.key_figure || { ...EMPTY_KEY_FIGURE });
    setBody(data.body || "");
    const suggestedId = String(data.suggested_domain || "").trim();
    const suggestedLabel = String(data.suggested_domain_label || "").trim();
    const suggestedReason = String(data.domain_suggestion_reason || "").trim();
    setDomainSuggestion(
      suggestedId && suggestedLabel && suggestedReason
        ? { id: suggestedId, label: suggestedLabel, reason: suggestedReason }
        : null,
    );
    setDomainProposalSent(false);
    setArchiveDeleteArmed(false);
  };

  const choosePrimaryDomain = (value: string) => {
    setPrimaryDomain(value);
    setDomains((current) => (value ? Array.from(new Set([value, ...current])) : current));
  };

  const toggleDomain = (value: string) => {
    if (value === primaryDomain) return;
    setDomains((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const uploadDrive = async () => {
    if (!pdfFile || !driveUploadEnabled || !ready) return;
    setBusy("drive");
    setUploadProgress(0);
    setMsg(null);
    try {
      const result = await uploadToDrive(pdfFile, slug, doi, setUploadProgress);
      setDrive(result.link);
      setArchived({ ...result, signature: archiveSignature });
      setMsg({
        kind: "ok",
        text: guest
          ? t("new.demoDriveUploaded")
          : result.reused
            ? t("new.driveDuplicate")
            : t("new.driveUploaded"),
        link: result.link,
      });
    } catch (error) {
      setMsg({
        kind: "warn",
        text: `${t("new.driveUploadFail")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  const resetDraft = () => {
    setPrimaryDomain("");
    setDomains([]);
    setPublicationType("journal-paper");
    setTitle("");
    setDoi("");
    setVenue("");
    setAbstract("");
    setCitationKey("");
    setAuthors("");
    setYear("");
    setTags("");
    setKeyReferences([]);
    setKeyFigure({ ...EMPTY_KEY_FIGURE });
    setDrive("");
    setNotes("");
    setBody("");
    setPdfName("");
    setPdfFile(null);
    setArchived(null);
    setDuplicateReview(null);
    setDomainSuggestion(null);
    setDomainProposalSent(false);
    setArchiveDeleteArmed(false);
    setUploadProgress(0);
    setSubmitAttempted(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeArchivedPdf = async () => {
    if (!archived) return;
    setBusy("delete");
    setMsg(null);
    try {
      if (!archived.reused) {
        const response = await fetch("/api/drive/file", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: archived.id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
      }
      if (keyFigure.image_ref && !guest) {
        await fetch("/api/drive/file", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: keyFigure.image_ref }),
        }).catch(() => {});
      }
      const reused = archived.reused;
      resetDraft();
      setMsg({
        kind: "ok",
        text: t(reused ? "new.driveDetached" : "new.driveDeleted"),
      });
    } catch (error) {
      setMsg({
        kind: "warn",
        text: `${t("new.driveDeleteFail")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  const onPdf = (file: File | undefined) => {
    if (!file) return;
    if (archived) {
      if (fileRef.current) fileRef.current.value = "";
      setMsg({ kind: "warn", text: t("new.removeArchiveFirst") });
      return;
    }
    setPdfName(file.name);
    setPdfFile(file);
    setDrive("");
    setArchived(null);
    setArchiveDeleteArmed(false);
    setDuplicateReview(null);
    setUploadProgress(0);
    setMsg({ kind: "ok", text: t("new.pdfSelected") });
  };

  const submitDomainProposal = async () => {
    if (!domainSuggestion) return;
    setBusy("domain");
    setMsg(null);
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: domainSuggestion.id,
          label: domainSuggestion.label,
          description: domainSuggestion.reason,
          reason: domainSuggestion.reason,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDomainProposalSent(true);
      setMsg({
        kind: "ok",
        text: t(data.demo ? "new.domainProposalDemo" : "new.domainProposalSent"),
      });
    } catch (error) {
      setMsg({
        kind: "warn",
        text: `${t("new.domainProposalFail")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  const extractSelectedPdf = async () => {
    if (!pdfFile) return;
    setBusy("extract");
    setMsg(null);
    try {
      const text = await extractPdfText(pdfFile);
      if (text.length < 80) throw new Error(t("new.pdfNoText"));
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      applyLiterature(data);
      let duplicateError = "";
      try {
        await checkDuplicates({
          title: data.title,
          doi: data.doi,
          citationKey: data.citation_key,
          authors: data.authors,
          year: data.year,
        });
      } catch (error) {
        duplicateError = error instanceof Error ? error.message : String(error);
      }
      setMsg({
        kind: duplicateError ? "warn" : "ok",
        text: `${data.demo
          ? t("new.demoExtracted")
          : driveUploadEnabled
            ? t("new.pdfOkUpload")
            : t("new.pdfOk")}${
          duplicateError ? ` ${t("new.duplicateFailed")}: ${duplicateError}` : ""
        }`,
      });
    } catch (error) {
      setMsg({
        kind: "warn",
        text: `${t("new.pdfFail")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  const analyzeOriginalPdf = async () => {
    if (!archived) return;
    setBusy("original");
    setMsg(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveFileId: archived.id }),
      });
      const extracted = await response.json();
      if (!response.ok) throw new Error(extracted.error);
      applyLiterature(extracted, true);
      let duplicateError = "";
      try {
        await checkDuplicates({
          title,
          doi: extracted.doi || doi,
          citationKey,
          authors: authorList,
          year: year ? Number(year) : null,
        });
      } catch (error) {
        duplicateError = error instanceof Error ? error.message : String(error);
      }
      setMsg({
        kind: duplicateError ? "warn" : "ok",
        text: `${t(extracted.demo ? "new.demoExtracted" : "new.driveVisionOk")}${
          duplicateError ? ` ${t("new.duplicateFailed")}: ${duplicateError}` : ""
        }`,
        link: archived.link,
      });
    } catch (error) {
      setMsg({
        kind: "warn",
        text: `${t("new.originalReadFail")}: ${error instanceof Error ? error.message : error}`,
        link: archived.link,
      });
    } finally {
      setBusy("");
    }
  };

  const lookupDoi = async () => {
    setBusy("doi");
    setMsg(null);
    try {
      const response = await fetch(`/api/doi?doi=${encodeURIComponent(doi.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTitle(data.title || title);
      setAuthors((data.authors || []).join(", "));
      setYear(data.year ? String(data.year) : "");
      setVenue(data.venue || venue);
      if (data.publication_type) setPublicationType(data.publication_type);
      if (!citationKey) setCitationKey(data.citation_key || "");
      let duplicateError = "";
      try {
        await checkDuplicates({
          title: data.title || title,
          doi: data.doi || doi,
          citationKey: citationKey || data.citation_key,
          authors: data.authors || authorList,
          year: data.year || (year ? Number(year) : null),
        });
      } catch (error) {
        duplicateError = error instanceof Error ? error.message : String(error);
      }
      setMsg({
        kind: duplicateError ? "warn" : "ok",
        text: `${t("new.doiOk")}${
          duplicateError ? ` ${t("new.duplicateFailed")}: ${duplicateError}` : ""
        }`,
      });
    } catch (error) {
      setMsg({ kind: "warn", text: `${t("new.doiFail")}: ${error}` });
    } finally {
      setBusy("");
    }
  };

  const draft = async () => {
    setBusy("draft");
    setMsg(null);
    try {
      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          authors: authorList,
          year: year ? Number(year) : null,
          venue,
          doi,
          notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBody(data.body);
      setMsg({ kind: "ok", text: t(data.demo ? "new.demoDrafted" : "new.draftOk") });
    } catch (error) {
      setMsg({ kind: "warn", text: `${t("new.draftFail")}: ${error}` });
    } finally {
      setBusy("");
    }
  };

  const submitLiterature = async () => {
    if (published) return;
    setSubmitAttempted(true);
    if (submissionErrors.length) {
      setMsg(null);
      return;
    }
    setBusy("commit");
    setMsg(null);
    try {
      const response = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content: fullMarkdown(),
          archive: archived
            ? {
                name: archived.name,
                uploadedBy: archived.uploadedBy,
                uploadedAt: archived.uploadedAt,
                reused: archived.reused,
              }
            : null,
          allowDuplicate:
            duplicateReviewCurrent && duplicateReview?.decision === "different",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPublished({ slug, url: data.card_url, demo: Boolean(data.demo) });
      setSubmitAttempted(false);
    } catch (error) {
      setMsg({ kind: "warn", text: `${t("new.prFail")}: ${error}` });
    } finally {
      setBusy("");
    }
  };

  const download = () => {
    const blob = new Blob([fullMarkdown()], { type: "text/markdown;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${slug || "literature"}.md`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <>
      {guest && <div className="notice guest">{t("new.demoHint")}</div>}
      <div className="pdf-zone">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(event) => onPdf(event.target.files?.[0])}
        />
        <div className="pdf-zone-main">
          <div>
            <b>{t("new.pdfTitle")}</b>
            <p className="subtitle" style={{ margin: "4px 0 0" }}>{t("new.pdfHint")}</p>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy !== ""}>
              {t("new.pdfBtn")}
            </button>
            <button
              className="btn primary"
              onClick={extractSelectedPdf}
              disabled={!pdfFile || busy !== ""}
            >
              {busy === "extract" ? t("new.pdfBusy") : t("new.aiExtract")}
            </button>
          </div>
        </div>
        {pdfName && <p className="subtitle" style={{ margin: "8px 0 0" }}>{pdfName}</p>}
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

      {title.trim() && citationKeyValid && (
        <div className={`duplicate-review ${duplicateConfirmed ? "confirmed" : ""}`}>
          <div className="duplicate-review-head">
            <div>
              <h2>{t("new.duplicateTitle")}</h2>
              <p>
                {!duplicateReviewCurrent
                  ? t("new.duplicateNeedsCheck")
                  : duplicateReview?.candidates.length
                    ? t("new.duplicateFound")
                    : t("new.duplicateClear")}
              </p>
            </div>
            <button
              className="btn"
              onClick={() => checkDuplicates().catch((error) => setMsg({
                kind: "warn",
                text: `${t("new.duplicateFailed")}: ${error instanceof Error ? error.message : error}`,
              }))}
              disabled={duplicateBusy || busy !== ""}
            >
              {duplicateBusy ? t("new.duplicateChecking") : t("new.duplicateCheck")}
            </button>
          </div>

          {duplicateReviewCurrent && duplicateReview?.candidates.map((candidate) => (
            <article className="duplicate-candidate" key={candidate.slug}>
              <div>
                <b>{candidate.title}</b>
                <p className="subtitle">
                  {candidate.authors.slice(0, 3).join(", ")}
                  {candidate.year ? ` · ${candidate.year}` : ""}
                </p>
                <p>{candidate.summary}</p>
                <div className="meta-row">
                  {candidate.reasons.map((reason) => (
                    <span className="badge" key={reason}>{t(`new.duplicateReason.${reason}`)}</span>
                  ))}
                </div>
              </div>
              <div className="duplicate-actions">
                <a className="btn" href={candidate.card_url} target="_blank" rel="noreferrer">
                  {t("new.duplicateOpenCard")}
                </a>
                {candidate.drive.map((link, index) => (
                  <a className="btn" href={link} target="_blank" rel="noreferrer" key={link}>
                    {t("new.duplicateOpenPdf")} {candidate.drive.length > 1 ? index + 1 : ""}
                  </a>
                ))}
                {!candidate.drive.length && (
                  <span className="duplicate-no-pdf">{t("new.duplicateNoPdf")}</span>
                )}
                <button
                  className="btn"
                  onClick={() => setDuplicateReview((current) => current
                    ? {
                        ...current,
                        decision: "duplicate",
                        selectedSlug: candidate.slug,
                      }
                    : current)}
                >
                  {t("new.duplicateSame")}
                </button>
              </div>
            </article>
          ))}

          {duplicateReviewCurrent && Boolean(duplicateReview?.candidates.length) && (
            <div className="duplicate-decision">
              <button
                className="btn primary"
                onClick={() => setDuplicateReview((current) => current
                  ? {
                      ...current,
                      decision: "different",
                      selectedSlug: undefined,
                    }
                  : current)}
              >
                {t("new.duplicateDifferent")}
              </button>
              {duplicateConfirmed && (
                <span>
                  {t("new.duplicateConfirmed")}{" "}
                  <a href={`/cards/${duplicateReview?.selectedSlug}`}>{t("new.duplicateUseExisting")}</a>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="form-card">
        <label>{t("new.primaryDomain")}</label>
        <select value={primaryDomain} onChange={(event) => choosePrimaryDomain(event.target.value)}>
          <option value="">{t("new.primaryDomainPick")}</option>
          {DOMAINS.map((item) => (
            <option key={item} value={item}>{DOMAIN_LABELS[item] || item}</option>
          ))}
        </select>

        <label>{t("new.relatedDomains")}</label>
        <p className="subtitle" style={{ margin: "4px 0 8px" }}>{t("new.domainsHint")}</p>
        <div className="domain-picker">
          {DOMAINS.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={domains.includes(item)}
                disabled={item === primaryDomain}
                onChange={() => toggleDomain(item)}
              />
              {DOMAIN_LABELS[item] || item}
              {item === primaryDomain ? ` (${t("new.primary")})` : ""}
            </label>
          ))}
        </div>
        {domainSuggestion && primaryDomain === "other" && (
          <div className="domain-suggestion">
            <b>{t("new.domainSuggestionTitle")}: {domainSuggestion.label}</b>
            <code>{domainSuggestion.id}</code>
            <p>{domainSuggestion.reason}</p>
            <p className="subtitle">{t("new.domainSuggestionHint")}</p>
            <button
              className="btn"
              onClick={submitDomainProposal}
              disabled={domainProposalSent || busy !== ""}
            >
              {domainProposalSent
                ? t("new.domainProposalPending")
                : busy === "domain"
                  ? t("new.domainProposalSending")
                  : t("new.domainProposalSubmit")}
            </button>
          </div>
        )}

        <label>{t("new.publicationType")}</label>
        <select value={publicationType} onChange={(event) => setPublicationType(event.target.value)}>
          {PUBLICATION_TYPES.map((item) => (
            <option key={item} value={item}>{PUBLICATION_TYPE_LABELS[item]}</option>
          ))}
        </select>

        <label>{t("new.doi")}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={doi} onChange={(event) => setDoi(event.target.value)} placeholder="10.1109/PROC.1975.10036" />
          <button className="btn" onClick={lookupDoi} disabled={!doi.trim() || busy !== ""}>
            {busy === "doi" ? t("new.fetching") : t("new.fetch")}
          </button>
        </div>

        <label>{t("new.literatureTitle")}</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} />

        <label>{t("new.citationKey")}</label>
        <input value={citationKey} onChange={(event) => setCitationKey(event.target.value)} placeholder="Elliott2018Head" />

        <label>{t("new.authors")}</label>
        <input value={authors} onChange={(event) => setAuthors(event.target.value)} />

        <label>{t("new.year")}</label>
        <input value={year} onChange={(event) => setYear(event.target.value)} inputMode="numeric" />

        <label>{t("new.venue")}</label>
        <input value={venue} onChange={(event) => setVenue(event.target.value)} placeholder="IEEE/ACM Transactions on Audio, Speech, and Language Processing" />

        <label>{t("new.abstract")}</label>
        <textarea rows={5} value={abstract} onChange={(event) => setAbstract(event.target.value)} />

        <label>{t("new.tags")}</label>
        <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="anc, fxlms, secondary-path" />

        <details className="key-reference-editor">
          <summary>
            <span>{t("new.keyReferences")}</span>
            <span className="badge">{keyReferences.length}</span>
          </summary>
          <p className="subtitle">{t("new.keyReferencesHint")}</p>
          {keyReferences.length ? (
            <div className="key-reference-list">
              {keyReferences.map((reference, index) => (
                <div className="key-reference-item" key={`${reference.title}-${index}`}>
                  <div>
                    <div className="key-reference-title">
                      {reference.role && <span className="badge type">{reference.role.replaceAll("_", " ")}</span>}
                      <strong>{reference.title}</strong>
                    </div>
                    <p>{reference.reason}</p>
                    <small>
                      {[reference.year, reference.doi ? `DOI: ${reference.doi}` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </div>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setKeyReferences((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    {t("new.keyReferenceRemove")}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="subtitle">{t("new.keyReferencesEmpty")}</p>
          )}
        </details>

        <KeyFigurePanel
          slug={slug}
          initialFigure={keyFigure}
          pdfFile={pdfFile}
          pdfLink={archived?.link || ""}
          canCache={Boolean(archived) || guest}
          onChange={setKeyFigure}
        />

        <label>{t("new.drive")}</label>
        <input value={drive} onChange={(event) => setDrive(event.target.value)} />

        <label>{t("new.notes")}</label>
        <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t("new.notesPh")} />

        {slug && (
          <p className="subtitle" style={{ margin: "10px 0 0" }}>
            {t("new.fileName")}: <code>official/{slug}.md</code>
          </p>
        )}
      </div>

      <div className="form-card">
        <label>{t("new.bodyLabel")}</label>
        <div className="btn-row" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={draft} disabled={!title.trim() || busy !== ""}>
            {busy === "draft" ? t("new.drafting") : t("new.draft")}
          </button>
          <button className="btn" onClick={() => setBody(LITERATURE_BODY_TEMPLATE.trim())} disabled={busy !== ""}>
            {t("new.blank")}
          </button>
        </div>
        <textarea rows={24} value={body} onChange={(event) => setBody(event.target.value)} />
      </div>

      {driveUploadEnabled && pdfFile && (
        <div className="form-card">
          <h2 style={{ marginTop: 0 }}>{t("new.archiveTitle")}</h2>
          <p className="subtitle">{t("new.archiveHint")}</p>
          <p className="subtitle">
            {t("new.archiveTarget")}: <code>NNNN_{slug || "citation-key"}.pdf</code>
          </p>
          {busy === "drive" && (
            <div className="upload-progress" aria-label={`${uploadProgress}%`}>
              <span style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
          <div className="btn-row">
            <button
              className="btn primary"
              onClick={uploadDrive}
              disabled={!ready || !duplicateResolved || duplicateConfirmed || busy !== "" || archiveCurrent}
            >
              {busy === "drive"
                ? `${t("new.driveUploading")} ${uploadProgress}%`
                : archiveCurrent
                  ? t("new.driveArchived")
                  : t("new.driveConfirmUpload")}
            </button>
            {archived && (
              <>
                <button
                  className="btn"
                  onClick={analyzeOriginalPdf}
                  disabled={busy !== "" || !archiveCurrent}
                >
                  {busy === "original" ? t("new.originalAnalyzing") : t("new.originalAnalyze")}
                </button>
                <a className="btn" href={archived.link} target="_blank" rel="noreferrer">
                  {t("new.driveOpenFile")}
                </a>
                {!archiveDeleteArmed ? (
                  <button
                    className="btn danger"
                    onClick={() => setArchiveDeleteArmed(true)}
                    disabled={busy !== ""}
                  >
                    {archived.reused ? t("new.driveDetach") : t("new.driveDeleteReset")}
                  </button>
                ) : (
                  <>
                    <button
                      className="btn danger"
                      onClick={removeArchivedPdf}
                      disabled={busy !== ""}
                    >
                      {busy === "delete"
                        ? t("new.driveDeleting")
                        : archived.reused
                          ? t("new.driveConfirmDetach")
                          : t("new.driveConfirmDelete")}
                    </button>
                    <button
                      className="btn"
                      onClick={() => setArchiveDeleteArmed(false)}
                      disabled={busy !== ""}
                    >
                      {t("new.cancel")}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          {!ready && (
            <div className="notice warn">
              <b>{t("new.archiveRequired")}</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {missingRequirements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          {archived && !archiveCurrent && <div className="notice warn">{t("new.archiveChanged")}</div>}
        </div>
      )}

      {msg && !published && (
        <div className={`notice ${msg.kind}`}>
          {msg.text} {msg.link && !guest && <a href={msg.link} target="_blank" rel="noreferrer">{msg.link}</a>}
        </div>
      )}

      {submitAttempted && submissionErrors.length > 0 && (
        <div className="publish-validation" role="alert">
          <h2>{t("new.validationTitle")}</h2>
          <p>{t("new.validationHint")}</p>
          <ul>
            {submissionErrors.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {published && (
        <div className="publish-success" role="status">
          <div className="publish-success-mark" aria-hidden="true">✓</div>
          <div>
            <h2>{t(published.demo ? "new.demoPublishedTitle" : "new.publishedTitle")}</h2>
            <p>{t(published.demo ? "new.demoPublishedHint" : "new.publishedHint")}</p>
            <div className="btn-row">
              {!published.demo && (
                <a className="btn" href={published.url} target="_blank" rel="noreferrer">
                  {t("new.openPublished")}
                </a>
              )}
              <a className="btn" href="/cards">{t("new.returnLibrary")}</a>
            </div>
          </div>
        </div>
      )}

      <div className="btn-row">
        <button
          className="btn primary"
          onClick={submitLiterature}
          disabled={busy !== "" || Boolean(published) || duplicateConfirmed}
        >
          {published
            ? t("new.publishedButton")
            : busy === "commit"
              ? t("new.submitting")
              : t("new.submitPr")}
        </button>
        <button className="btn" onClick={download} disabled={!ready}>{t("new.download")}</button>
        <button className="btn" onClick={() => navigator.clipboard.writeText(fullMarkdown())} disabled={!ready}>
          {t("new.copyMd")}
        </button>
      </div>
      {currentUser && <p className="subtitle">{t("new.publishingAs")}: <b>{currentUser}</b></p>}
    </>
  );
}
