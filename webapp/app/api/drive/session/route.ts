import { NextRequest, NextResponse } from "next/server";
import { driveConfigured, getDriveAccessToken } from "@/lib/google";

export const runtime = "nodejs";

const SOURCE_TYPES = new Set(["paper", "conference", "book", "patent", "other"]);

async function findOrCreateSubfolder(token: string, rootId: string, name: string): Promise<string> {
  const q = encodeURIComponent(
    `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
  );
  const list = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = (await list.json()) as { files?: { id: string }[] };
  if (data.files?.length) return data.files[0].id;

  const created = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [rootId] }),
  });
  return ((await created.json()) as { id: string }).id;
}

// Next global running number (zero-padded). With the drive.file scope, listing
// returns only files this app created — i.e. the library — so the max leading
// "NNNN_" across them gives the next id.
async function nextId(token: string): Promise<string> {
  const q = encodeURIComponent("trashed=false and mimeType!='application/vnd.google-apps.folder'");
  const list = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=1000&fields=files(name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = (await list.json()) as { files?: { name: string }[] };
  let max = 0;
  for (const f of data.files || []) {
    const m = /^(\d+)_/.exec(f.name || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return String(max + 1).padStart(4, "0");
}

export async function POST(req: NextRequest) {
  if (!driveConfigured()) {
    return NextResponse.json(
      { error: "Drive upload not configured (set owner OAuth or a service-account key)." },
      { status: 501 },
    );
  }

  const body = (await req.json()) as {
    base?: string;
    sourceType?: string;
    mimeType?: string;
    size?: number;
  };
  const base = (body.base || "file").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  const sourceType = SOURCE_TYPES.has(body.sourceType || "") ? body.sourceType! : "other";

  let token: string;
  try {
    token = await getDriveAccessToken();
  } catch (e) {
    return NextResponse.json({ error: `auth failed: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }

  const rootId = process.env.DRIVE_FOLDER_ID;
  let parentId = rootId;
  try {
    if (rootId) parentId = await findOrCreateSubfolder(token, rootId, sourceType);
    const id = await nextId(token);
    const name = `${id}_${base}.pdf`;

    const init = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": body.mimeType || "application/pdf",
          ...(body.size ? { "X-Upload-Content-Length": String(body.size) } : {}),
        },
        body: JSON.stringify({ name, ...(parentId ? { parents: [parentId] } : {}) }),
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
    return NextResponse.json({ uploadUrl, name });
  } catch (e) {
    return NextResponse.json({ error: `Drive setup failed: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }
}
