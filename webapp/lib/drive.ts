// Browser → Google Drive upload. The server (holding the owner's OAuth token or
// a service-account key) starts a resumable upload session and returns its URL;
// the browser then PUTs the file bytes straight to Google. The file never
// passes through our server, so there is no upload size limit.

export interface DriveResult {
  id: string;
  link: string;
}

export async function uploadToDrive(file: File): Promise<DriveResult> {
  const sess = await fetch("/api/drive/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      mimeType: file.type || "application/pdf",
      size: file.size,
    }),
  });
  const sd = (await sess.json()) as { uploadUrl?: string; error?: string };
  if (!sess.ok || !sd.uploadUrl) throw new Error(sd.error || "could not start upload");

  const put = await fetch(sd.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/pdf" },
    body: file,
  });
  if (!put.ok) throw new Error(`Drive upload ${put.status}: ${(await put.text()).slice(0, 200)}`);
  const meta = (await put.json()) as { id: string; webViewLink?: string };
  return { id: meta.id, link: meta.webViewLink || `https://drive.google.com/file/d/${meta.id}/view` };
}
