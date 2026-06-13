import { NextRequest, NextResponse } from "next/server";
import { driveConfigured, getDriveAccessToken } from "@/lib/google";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!driveConfigured()) {
    return NextResponse.json(
      { error: "Drive upload not configured (set owner OAuth or a service-account key)." },
      { status: 501 },
    );
  }

  const { name, mimeType, size } = (await req.json()) as {
    name?: string;
    mimeType?: string;
    size?: number;
  };
  if (!name) return NextResponse.json({ error: "file name required" }, { status: 400 });

  let token: string;
  try {
    token = await getDriveAccessToken();
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
