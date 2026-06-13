// Shared Google Drive auth + file access (server-side). Owner OAuth (refresh
// token) is preferred and works on a personal Gmail Drive; a service-account
// key is the fallback for Workspace Shared Drives.
import crypto from "crypto";

function hasOwnerOAuth(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
      process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
}

export function driveConfigured(): boolean {
  return hasOwnerOAuth() || Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}

export async function getDriveAccessToken(): Promise<string> {
  if (hasOwnerOAuth()) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      }),
    });
    if (!res.ok) throw new Error(`oauth refresh ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return ((await res.json()) as { access_token: string }).access_token;
  }

  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!) as {
    client_email: string;
    private_key: string;
  };
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(creds.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`sa token ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Download a Drive file's bytes (the app can read files it uploaded). */
export async function fetchDriveFile(fileId: string): Promise<Buffer> {
  const token = await getDriveAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`drive download ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}
