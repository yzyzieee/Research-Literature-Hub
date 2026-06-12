import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

// Mint a Google access token from the service-account key (JWT bearer grant).
// Done manually with node crypto to avoid an extra dependency.
async function getAccessToken(creds: ServiceAccount): Promise<string> {
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
  if (!res.ok) throw new Error(`token ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function POST(req: NextRequest) {
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyRaw) {
    return NextResponse.json(
      { error: "Drive upload not configured (GOOGLE_SERVICE_ACCOUNT_KEY missing)." },
      { status: 501 },
    );
  }
  let creds: ServiceAccount;
  try {
    creds = JSON.parse(keyRaw);
  } catch {
    return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON." }, { status: 500 });
  }

  const { name, mimeType, size } = (await req.json()) as {
    name?: string;
    mimeType?: string;
    size?: number;
  };
  if (!name) return NextResponse.json({ error: "file name required" }, { status: 400 });

  let token: string;
  try {
    token = await getAccessToken(creds);
  } catch (e) {
    return NextResponse.json({ error: `auth failed: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }

  const folderId = process.env.DRIVE_FOLDER_ID;
  const metadata: { name: string; parents?: string[] } = { name };
  if (folderId) metadata.parents = [folderId];

  const init = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType || "application/pdf",
        ...(size ? { "X-Upload-Content-Length": String(size) } : {}),
      },
      body: JSON.stringify(metadata),
    },
  );
  if (!init.ok) {
    return NextResponse.json(
      { error: `Drive init ${init.status}: ${(await init.text()).slice(0, 300)}` },
      { status: 502 },
    );
  }
  const uploadUrl = init.headers.get("location");
  if (!uploadUrl) {
    return NextResponse.json({ error: "no resumable session URL returned by Drive" }, { status: 502 });
  }
  return NextResponse.json({ uploadUrl });
}
