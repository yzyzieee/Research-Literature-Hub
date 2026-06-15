// Client-side PDF processing. Large PDFs stay in the browser; only extracted
// text or a user-confirmed image crop is sent to the app.

type PdfSource = File | Blob | ArrayBuffer | string;

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
  const doc = await openPdf(file);
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");
    out += `\n--- PDF PAGE ${i} ---\n${line}\n`;
    if (out.length >= maxChars) break;
  }
  return out.slice(0, maxChars).trim();
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
