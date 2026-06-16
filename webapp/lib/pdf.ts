// Client-side PDF processing. Large PDFs stay in the browser; only extracted
// text or a user-confirmed image crop is sent to the app.

type PdfSource = File | Blob | ArrayBuffer | string;

export interface ExtractedPdfText {
  text: string;
  pageCount: number;
  printedPageMap: Record<string, number>;
}

async function pdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  return pdfjs;
}

async function openPdf(source: PdfSource) {
  const pdfjs = await pdfJs();
  if (typeof source === "string") {
    return pdfjs.getDocument({ url: source, withCredentials: true }).promise;
  }
  const data = source instanceof ArrayBuffer ? source : await source.arrayBuffer();
  return pdfjs.getDocument({ data }).promise;
}

export async function extractPdfText(file: File, maxChars = 60000): Promise<string> {
  return (await extractPdfTextWithPageInfo(file, maxChars)).text;
}

function addPrintedPage(seen: Map<number, Set<number>>, printed: number, pdfPage: number) {
  if (!seen.has(printed)) seen.set(printed, new Set());
  seen.get(printed)!.add(pdfPage);
}

function likelyPrintedPageNumbers(text: string): number[] {
  const compact = text.replace(/\s+/g, " ").trim();
  const zones = [compact.slice(0, 420), compact.slice(-420)];
  const values = new Set<number>();
  for (const zone of zones) {
    for (const match of zone.matchAll(/\b([1-9]\d{0,4})\b/g)) {
      const value = Number(match[1]);
      if (value >= 1900 && value <= 2099) continue;
      values.add(value);
    }
  }
  return [...values];
}

export async function extractPdfTextWithPageInfo(
  file: File,
  maxChars = 60000,
): Promise<ExtractedPdfText> {
  const doc = await openPdf(file);
  const printedPages = new Map<number, Set<number>>();
  let out = "";
  try {
    const labels = await (doc as { getPageLabels?: () => Promise<(string | null)[] | null> })
      .getPageLabels?.();
    labels?.forEach((label, index) => {
      const numeric = Number(String(label || "").trim());
      if (Number.isInteger(numeric) && numeric > 0) addPrintedPage(printedPages, numeric, index + 1);
    });
  } catch {
    // Page labels are optional PDF metadata; text headers/footers are the fallback.
  }
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");
    for (const printed of likelyPrintedPageNumbers(line)) {
      addPrintedPage(printedPages, printed, i);
    }
    // Keep scanning after maxChars so printed page labels can still be mapped
    // back to real PDF pages, while only the capped text is sent to the LLM.
    if (out.length < maxChars) out += `\n--- PDF PAGE ${i} ---\n${line}\n`;
  }
  const printedPageMap: Record<string, number> = {};
  for (const [printed, pages] of printedPages.entries()) {
    if (pages.size === 1) printedPageMap[String(printed)] = [...pages][0];
  }
  return {
    text: out.slice(0, maxChars).trim(),
    pageCount: doc.numPages,
    printedPageMap,
  };
}

// A loaded document, opened once so page navigation doesn't re-download the PDF.
export type PdfDoc = Awaited<ReturnType<typeof openPdf>>;

export async function loadPdfDoc(source: PdfSource): Promise<PdfDoc> {
  return openPdf(source);
}

export function pdfPageCount(doc: PdfDoc): number {
  return doc.numPages;
}

/** Render one page of an already-loaded document into a canvas. */
export async function renderDocPage(
  doc: PdfDoc,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  maxWidth = 1400,
): Promise<{ pages: number; width: number; height: number }> {
  const safePage = Math.min(Math.max(Math.trunc(pageNumber), 1), doc.numPages);
  const page = await doc.getPage(safePage);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2.2, Math.max(0.2, maxWidth / Math.max(base.width, 1)));
  const viewport = page.getViewport({ scale });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return { pages: doc.numPages, width: canvas.width, height: canvas.height };
}

export async function canvasCropBlob(
  canvas: HTMLCanvasElement,
  crop?: { x: number; y: number; width: number; height: number } | null,
): Promise<Blob> {
  const rect = crop && crop.width >= 8 && crop.height >= 8
    ? crop
    : { x: 0, y: 0, width: canvas.clientWidth, height: canvas.clientHeight };
  const scaleX = canvas.width / Math.max(canvas.clientWidth, 1);
  const scaleY = canvas.height / Math.max(canvas.clientHeight, 1);
  const sx = Math.max(0, Math.round(rect.x * scaleX));
  const sy = Math.max(0, Math.round(rect.y * scaleY));
  const sw = Math.min(canvas.width - sx, Math.max(1, Math.round(rect.width * scaleX)));
  const sh = Math.min(canvas.height - sy, Math.max(1, Math.round(rect.height * scaleY)));
  const output = document.createElement("canvas");
  output.width = sw;
  output.height = sh;
  const context = output.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas export is unavailable in this browser.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, sw, sh);
  context.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return new Promise((resolve, reject) => {
    output.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Could not create the figure preview.")),
      "image/png",
      0.92,
    );
  });
}
