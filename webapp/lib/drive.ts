// Upload in small same-origin chunks. Each request stays below common
// serverless request limits, and the server forwards it to Drive's resumable
// session without exposing OAuth credentials or relying on Google CORS.

const CHUNK_SIZE = 3 * 1024 * 1024;

export interface DriveResult {
  id: string;
  link: string;
  name: string;
  reused: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

async function uploadFileToDrive(
  file: File | Blob,
  payload: Record<string, unknown>,
  onProgress?: (percent: number) => void,
): Promise<DriveResult> {
  const sess = await fetch("/api/drive/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  const session = (await sess.json()) as {
    uploadUrl?: string;
    name?: string;
    uploadedBy?: string;
    uploadedAt?: string;
    error?: string;
    demo?: {
      id: string;
      name: string;
      link: string;
      uploadedBy: string;
      uploadedAt: string;
    };
    existing?: {
      id: string;
      name: string;
      link: string;
      uploadedBy: string;
      uploadedAt: string;
    };
  };
  if (sess.ok && session.demo) {
    onProgress?.(100);
    return { ...session.demo, reused: false };
  }
  if (sess.ok && session.existing) {
    onProgress?.(100);
    return { ...session.existing, reused: true };
  }
  if (!sess.ok || !session.uploadUrl) {
    throw new Error(session.error || "Could not start the Drive upload.");
  }

  let final: { id: string; link: string } | null = null;
  for (let start = 0; start < file.size; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    let response: Response;

    try {
      response = await fetch("/api/drive/upload", {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/pdf",
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
          "X-Drive-Upload-Url": session.uploadUrl,
        },
        body: chunk,
      });
    } catch (error) {
      throw new Error(
        `Network error on chunk ${Math.floor(start / CHUNK_SIZE) + 1}: ${error instanceof Error ? error.message : error}`,
      );
    }

    const data = (await response.json()) as {
      complete?: boolean;
      id?: string;
      link?: string;
      error?: string;
    };
    if (!response.ok) throw new Error(data.error || `Upload chunk failed (${response.status}).`);
    onProgress?.(Math.round((end / file.size) * 100));
    if (data.complete && data.id && data.link) final = { id: data.id, link: data.link };
  }

  if (!final) throw new Error("Drive did not confirm the completed upload.");
  return {
    ...final,
    name: session.name || ("name" in file ? file.name : "file"),
    reused: false,
    uploadedBy: session.uploadedBy || "",
    uploadedAt: session.uploadedAt || "",
  };
}

export async function uploadToDrive(
  file: File,
  base: string,
  doi = "",
  onProgress?: (percent: number) => void,
): Promise<DriveResult> {
  return uploadFileToDrive(file, { kind: "paper", base, doi }, onProgress);
}

export async function uploadKeyFigureToDrive(
  file: File | Blob,
  literatureKey: string,
  figureId: string,
  onProgress?: (percent: number) => void,
): Promise<DriveResult> {
  return uploadFileToDrive(
    file,
    {
      kind: "key-figure",
      base: literatureKey,
      figureId,
    },
    onProgress,
  );
}

export function driveFileId(link: string): string {
  const match =
    link.match(/\/d\/([A-Za-z0-9_-]+)/) ||
    link.match(/[?&]id=([A-Za-z0-9_-]+)/);
  return match?.[1] || "";
}
