"use client";

import { useEffect, useRef, useState } from "react";
import { LITERATURE_BODY_TEMPLATE } from "@/lib/templates";
import {
  DOMAINS,
  DOMAIN_LABELS,
  PUBLICATION_TYPES,
  PUBLICATION_TYPE_LABELS,
} from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { extractPdfText } from "@/lib/pdf";
import { uploadToDrive } from "@/lib/drive";

function yamlList(items: string[]): string {
  return items.length ? `[${items.map((item) => JSON.stringify(item)).join(", ")}]` : "[]";
}

type BusyAction = "" | "doi" | "draft" | "commit" | "extract" | "drive" | "original";

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
  tags?: string[];
  body?: string;
}

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
    needsArchive && !archiveCurrent ? t("new.missingArchive") : "",
  ].filter(Boolean);

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
    setBody(data.body || "");
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

  const onPdf = (file: File | undefined) => {
    if (!file) return;
    setPdfName(file.name);
    setPdfFile(file);
    setDrive("");
    setArchived(null);
    setUploadProgress(0);
    setMsg({ kind: "ok", text: t("new.pdfSelected") });
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
      setMsg({
        kind: "ok",
        text: data.demo
          ? t("new.demoExtracted")
          : driveUploadEnabled
            ? t("new.pdfOkUpload")
            : t("new.pdfOk"),
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
      setMsg({
        kind: "ok",
        text: t(extracted.demo ? "new.demoExtracted" : "new.driveVisionOk"),
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
      setMsg({ kind: "ok", text: t("new.doiOk") });
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
            <button className="btn primary" onClick={uploadDrive} disabled={!ready || busy !== "" || archiveCurrent}>
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
        <button className="btn primary" onClick={submitLiterature} disabled={busy !== "" || Boolean(published)}>
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
