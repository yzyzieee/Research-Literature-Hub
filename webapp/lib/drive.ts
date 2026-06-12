// Browser → Google Drive direct upload. The file goes straight from the
// browser to Drive (never through our server), so there is no upload size
// limit. Uses Google Identity Services for a short-lived access token with the
// non-sensitive `drive.file` scope (no Google app-verification needed).

interface TokenClient {
  requestAccessToken: () => void;
}
interface GoogleGsi {
  accounts: {
    oauth2: {
      initTokenClient: (cfg: {
        client_id: string;
        scope: string;
        callback: (resp: { access_token?: string; error?: string }) => void;
      }) => TokenClient;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleGsi;
  }
}

let gisLoaded: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (gisLoaded) return gisLoaded;
  gisLoaded = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google sign-in"));
    document.head.appendChild(s);
  });
  return gisLoaded;
}

async function getToken(clientId: string): Promise<string> {
  await loadGis();
  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (resp) => {
        if (resp.error || !resp.access_token) reject(new Error(resp.error || "no access token"));
        else resolve(resp.access_token);
      },
    });
    client.requestAccessToken();
  });
}

/** Upload a file to the given Drive folder; returns a shareable link. */
export async function uploadToDrive(file: File, clientId: string, folderId?: string): Promise<string> {
  const token = await getToken(clientId);
  const metadata: { name: string; parents?: string[] } = { name: file.name };
  if (folderId) metadata.parents = [folderId];

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form },
  );
  if (!res.ok) {
    throw new Error(`Drive upload ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = (await res.json()) as { id: string; webViewLink?: string };
  return data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`;
}
