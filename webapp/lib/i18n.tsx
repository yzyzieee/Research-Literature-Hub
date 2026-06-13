"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "zh";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    "brand.tagline": "Audio research knowledge base",
    "nav.library": "Library",
    "nav.review": "Review",
    "nav.new": "New card",
    "nav.export": "Export",
    "footer": "PDFs stay in Drive · cards, templates, index and scripts stay in GitHub",

    "home.title": "Audio research knowledge base",
    "home.subtitle": "Collaborative knowledge base · audio / ANC / signal processing",
    "home.official": "official cards",
    "home.pending": "pending",
    "home.pendingReview": "Pending review",
    "home.viewQueue": "Open queue →",
    "home.recent": "Recently updated",
    "home.browseAll": "Browse all →",

    "cards.title": "Library",
    "cards.subtitle": "All cards (including drafts), instant client-side search.",
    "cards.search": "Search title / tags / authors / summary …",
    "cards.allTypes": "All types",
    "cards.allDomains": "All domains",
    "cards.unit": "cards",

    "detail.authors": "Authors",
    "detail.citationKey": "Citation key",
    "detail.related": "Related",
    "detail.copy": "📋 Copy for your LLM",
    "detail.edit": "Edit on GitHub ↗",
    "detail.fulltext": "Full text / data",

    "pending.title": "Review queue",
    "pending.subtitle": "Drafts in pending. Review happens in GitHub PRs — the LLM only assists; a human is the final academic judge.",
    "pending.openPRs": "Open PR list ↗",
    "pending.checklist": "Review checklist",
    "pending.c1": "Metadata complete: title, type, tags, and (for papers) a citation key matching Zotero",
    "pending.c2": "Content verified: equations, claims and references check out",
    "pending.c3": "Knowledge value & correct cross-links ([[…]]) to existing cards",
    "pending.c4": "On approval: reviewer sets status to official; CI promotes the card after merge",
    "pending.count": "drafts awaiting review",
    "pending.empty": "Queue is empty 🎉",

    "new.title": "New card",
    "new.subtitle": "Upload a PDF for auto-extraction, or fill metadata manually → review → open a PR into pending for human review.",
    "new.pdfTitle": "Submit a paper PDF",
    "new.pdfHint": "Reads the full paper text in your browser (no upload size limit), then DeepSeek auto-fills the type, metadata and a card distilled from the whole text. Works on digital text PDFs — scanned/image-only PDFs have no extractable text. Review before submitting.",
    "new.pdfBtn": "Choose PDF & auto-fill",
    "new.pdfBusy": "Reading & drafting…",
    "new.pdfOk": "Auto-filled from the PDF — check the type and every field, then submit. The LLM only assists; you are the final judge.",
    "new.pdfFail": "PDF auto-fill failed",
    "new.pdfNoText": "no selectable text (scanned image PDF?)",
    "new.driveReminder": "Upload the PDF file itself to the shared Google Drive folder and paste its link into the Drive field below.",
    "new.driveAuto": "After choosing a PDF, click “Upload to Drive” to push it straight into the shared library — no sign-in needed; the Drive link fills in automatically.",
    "new.driveOpen": "Open shared Drive folder ↗",
    "new.driveUpload": "Upload to Drive",
    "new.driveUploading": "Uploading…",
    "new.driveUploaded": "Uploaded to Drive — link added below.",
    "new.driveVisionOk": "Uploaded to Drive and re-analysed from the original PDF (figures + equations). Review every field, then submit.",
    "new.driveUploadFail": "Drive upload failed",
    "new.pdfOkUpload": "Drafted from the text. For the best result click “Upload to Drive” — it stores the PDF and re-reads the original (figures + equations).",
    "new.type": "Card type",
    "new.domain": "Domain (research field) *",
    "new.domainPick": "— pick a domain —",
    "new.sourceType": "Source type (for the Drive archive)",
    "new.doi": "DOI (optional metadata auto-fill)",
    "new.fetch": "Fetch",
    "new.fetching": "Fetching…",
    "new.cardTitle": "Title *",
    "new.citationKey": "Citation key (Better BibTeX, used as the file name) *",
    "new.authors": "Authors (comma-separated)",
    "new.year": "Year",
    "new.tags": "Tags (comma/space-separated, lowercase)",
    "new.drive": "Google Drive links (PDF / data, space-separated)",
    "new.notes": "Notes for drafting (optional)",
    "new.notesPh": "Points to emphasise, relevance to our project, sections to expand…",
    "new.fileName": "file",
    "new.bodyLabel": "Body (leave empty for the template skeleton; or draft with DeepSeek then edit)",
    "new.draft": "✨ Draft English card with DeepSeek",
    "new.drafting": "Drafting…",
    "new.blank": "Insert blank template",
    "new.submitPr": "Open PR into pending",
    "new.submitting": "Submitting…",
    "new.download": "Download .md",
    "new.copyMd": "Copy markdown",
    "new.doiOk": "Metadata fetched from Crossref. Override the citation key with your Zotero / Better BibTeX value.",
    "new.doiFail": "DOI lookup failed",
    "new.draftOk": "Draft generated (DeepSeek) — review section by section before submitting. The LLM only assists; you are the final judge.",
    "new.draftFail": "Drafting failed",
    "new.prOk": "PR created, awaiting review",
    "new.prFail": "Submit failed",

    "export.title": "Export for your LLM",
    "export.subtitle": "Pick cards → bundle into a prompt → paste into each member's own ChatGPT / Claude / Kimi for literature research. No team API spend.",
    "export.filter": "Filter by title / tags …",
    "export.allTypes": "All types",
    "export.selectAll": "Select shown",
    "export.clear": "Clear",
    "export.hasFulltext": "📎 full-text link",
    "export.selected": "cards selected",
    "export.hint": "Copy, then paste into any LLM (ChatGPT / Claude / Kimi …) as context. Each card carries its Drive full-text link and GitHub source link.",
    "export.copy": "Copy bundle",
    "export.download": "Download .md",
    "export.preview": "Preview",

    "copy.copied": "✓ Copied",

    "login.subtitle": "Team access — enter the shared password to continue.",
    "login.password": "Password",
    "login.submit": "Enter",
    "login.wrong": "Wrong password.",
    "login.logout": "Sign out",
  },
  zh: {
    "brand.tagline": "音频研究知识库",
    "nav.library": "卡片库",
    "nav.review": "审核队列",
    "nav.new": "新建卡片",
    "nav.export": "导出",
    "footer": "PDF 留在 Drive · 卡片、模板、索引与脚本留在 GitHub",

    "home.title": "音频研究知识库",
    "home.subtitle": "协作知识库 · 音频 / 主动降噪 / 信号处理",
    "home.official": "正式卡片",
    "home.pending": "待审核",
    "home.pendingReview": "待审核",
    "home.viewQueue": "查看队列 →",
    "home.recent": "最近更新",
    "home.browseAll": "浏览全部 →",

    "cards.title": "卡片库",
    "cards.subtitle": "全部卡片（含待审核），客户端即时搜索。",
    "cards.search": "搜索标题 / 标签 / 作者 / 摘要 …",
    "cards.allTypes": "全部类型",
    "cards.allDomains": "全部领域",
    "cards.unit": "张卡片",

    "detail.authors": "作者",
    "detail.citationKey": "引用键",
    "detail.related": "相关卡片",
    "detail.copy": "📋 复制喂给你的 LLM",
    "detail.edit": "在 GitHub 上编辑 ↗",
    "detail.fulltext": "全文 / 数据",

    "pending.title": "审核队列",
    "pending.subtitle": "pending 中的草稿卡。审核在 GitHub PR 中进行——LLM 只辅助，人是最终学术裁判。",
    "pending.openPRs": "打开 PR 列表 ↗",
    "pending.checklist": "审核清单",
    "pending.c1": "元数据完整：标题、type、tags，论文卡的 citation key 与 Zotero 一致",
    "pending.c2": "内容已核对：公式、结论、引用出处可查",
    "pending.c3": "有知识价值，且与已有卡片正确互链（[[…]]）",
    "pending.c4": "通过后：审核人将 status 改为 official；合并后 CI 自动晋升",
    "pending.count": "张待审卡片",
    "pending.empty": "队列为空 🎉",

    "new.title": "新建卡片",
    "new.subtitle": "上传 PDF 自动解析，或手动填写元数据 → 审核 → 提交 PR 进入 pending 等待人工审核。",
    "new.pdfTitle": "提交论文 PDF",
    "new.pdfHint": "在浏览器里读取论文全文（无上传大小限制），再由 DeepSeek 自动判定类型、填好元数据、并基于整篇全文提炼正文。适用于电子版文字 PDF——纯扫描/图片 PDF 无可提取文字。提交前请核对。",
    "new.pdfBtn": "选择 PDF 并自动填充",
    "new.pdfBusy": "读取并起草中…",
    "new.pdfOk": "已根据 PDF 自动填充——请核对类型和每个字段后再提交。LLM 只辅助，人是最终裁判。",
    "new.pdfFail": "PDF 自动填充失败",
    "new.pdfNoText": "PDF 中没有可选文字（可能是扫描图片版）",
    "new.driveReminder": "请把 PDF 文件本身上传到团队共享的 Google Drive 文件夹，并把链接粘到下面的 Drive 字段。",
    "new.driveAuto": "选好 PDF 后点“上传到 Drive”，文件直接传入共享文献库，无需登录，Drive 链接会自动填好。",
    "new.driveOpen": "打开共享 Drive 文件夹 ↗",
    "new.driveUpload": "上传到 Drive",
    "new.driveUploading": "上传中…",
    "new.driveUploaded": "已上传到 Drive，链接已自动填入。",
    "new.driveVisionOk": "已上传到 Drive，并由 Gemini 读取原 PDF（含图表/公式）重新提炼。请核对每个字段后提交。",
    "new.driveUploadFail": "Drive 上传失败",
    "new.pdfOkUpload": "已根据文字起草。想要最佳效果请点“上传到 Drive”——它会存好 PDF 并读取原文件（含图表/公式）重新提炼。",
    "new.type": "卡片类型",
    "new.domain": "领域（研究方向）*",
    "new.domainPick": "— 选择领域 —",
    "new.sourceType": "来源类型（用于 Drive 归档）",
    "new.doi": "DOI（可自动抓取元数据）",
    "new.fetch": "抓取",
    "new.fetching": "查询中…",
    "new.cardTitle": "标题 *",
    "new.citationKey": "Citation key（Better BibTeX，作为文件名）*",
    "new.authors": "作者（逗号分隔）",
    "new.year": "年份",
    "new.tags": "标签（逗号/空格分隔，小写）",
    "new.drive": "Google Drive 链接（PDF / 数据，空格分隔）",
    "new.notes": "起草要点提示（可选）",
    "new.notesPh": "想突出的重点、与课题的关联、需要展开的小节…",
    "new.fileName": "文件名",
    "new.bodyLabel": "正文（留空则用模板骨架；可先用 DeepSeek 生成再改）",
    "new.draft": "✨ 用 DeepSeek 生成英文卡片",
    "new.drafting": "起草中…",
    "new.blank": "插入空白模板",
    "new.submitPr": "提交 PR 到 pending",
    "new.submitting": "提交中…",
    "new.download": "下载 .md",
    "new.copyMd": "复制 Markdown",
    "new.doiOk": "已从 Crossref 获取元数据。请用 Zotero / Better BibTeX 的 citation key 覆盖建议值。",
    "new.doiFail": "DOI 查询失败",
    "new.draftOk": "草稿已生成（DeepSeek）——请逐节核对后再提交。LLM 只辅助，人是最终裁判。",
    "new.draftFail": "生成失败",
    "new.prOk": "PR 已创建，等待审核",
    "new.prFail": "提交失败",

    "export.title": "导出给你的 LLM",
    "export.subtitle": "勾选卡片 → 打包成提示词 → 粘贴到每个成员自己的 ChatGPT / Claude / Kimi 做文献调研。不消耗团队 API 额度。",
    "export.filter": "按标题 / 标签过滤 …",
    "export.allTypes": "全部类型",
    "export.selectAll": "全选当前",
    "export.clear": "清空",
    "export.hasFulltext": "📎 有全文链接",
    "export.selected": "张卡片已选",
    "export.hint": "复制后粘贴到任意 LLM（ChatGPT / Claude / Kimi …）作为上下文；每张卡都带 Drive 全文链接与 GitHub 源链接。",
    "export.copy": "复制卡片包",
    "export.download": "下载 .md",
    "export.preview": "预览",

    "copy.copied": "✓ 已复制",

    "login.subtitle": "团队访问 — 输入共享密码后继续。",
    "login.password": "密码",
    "login.submit": "进入",
    "login.wrong": "密码错误。",
    "login.logout": "退出登录",
  },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
}

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("kb-lang");
    if (saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("kb-lang", l);
  };

  const t = (k: string) => dict[lang][k] ?? dict.en[k] ?? k;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Inline translated string for use inside server components. */
export function T({ k }: { k: string }) {
  const { t } = useLang();
  return <>{t(k)}</>;
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      aria-label={lang === "en" ? "切换到中文" : "Switch to English"}
      title={lang === "en" ? "切换到中文" : "Switch to English"}
    >
      {lang === "en" ? "中文" : "EN"}
    </button>
  );
}
