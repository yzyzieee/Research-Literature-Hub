// Client-side PDF text extraction. Runs entirely in the browser so large PDFs
// never hit the serverless body limit — only the extracted text is sent on.

export async function extractPdfText(file: File, maxChars = 60000): Promise<string> {
  // Dynamic import keeps pdfjs out of the server bundle / SSR pass.
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    out += line + "\n";
    if (out.length >= maxChars) break;
  }
  return out.slice(0, maxChars).trim();
}
