import { NextRequest, NextResponse } from "next/server";
import { driveConfigured, getDriveAccessToken } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCE_TYPES = new Set(["paper", "conference", "book", "patent", "other"]);

interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  appProperties?: Record<string, string>;
}

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function normalizedDoi(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

async function findOrCreateSubfolder(token: string, rootId: string, name: string): Promise<string> {
  const q = [
    `'${escapeDriveQuery(rootId)}' in parents`,
    "mimeType='application/vnd.google-apps.folder'",
    `name='${escapeDriveQuery(name)}'`,
    "trashed=false",
  ].join(" and ");
  const params = new URLSearchParams({
    q,
    fields: "files(id)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const list = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!list.ok) {
    throw new Error(`folder lookup ${list.status}: ${(await list.text()).slice(0, 200)}`);
  }
  const data = (await list.json()) as { files?: { id: string }[] };
  if (data.files?.length) return data.files[0].id;

  const created = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [rootId] }),
  });
  if (!created.ok) {
    throw new Error(`folder creation ${created.status}: ${(await created.text()).slice(0, 200)}`);
  }
  return ((await created.json()) as { id: string }).id;
}

async function listLibraryFiles(token: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      q: "trashed=false and mimeType!='application/vnd.google-apps.folder'",
      pageSize: "1000",
      fields: "nextPageToken,files(id,name,webViewLink,appProperties)",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const list = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!list.ok) {
      throw new Error(`file lookup ${list.status}: ${(await list.text()).slice(0, 200)}`);
    }
    const data = (await list.json()) as { files?: DriveFile[]; nextPageToken?: string };
    files.push(...(data.files || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return files;
}

function findDuplicate(files: DriveFile[], base: string, doi: string): DriveFile | undefined {
  const expectedSuffix = `_${base}.pdf`;
  return files.find((file) => {
    const fileDoi = normalizedDoi(file.appProperties?.doi);
    if (doi && fileDoi && fileDoi === doi) return true;
    return file.appProperties?.literatureKey === base ||
      file.name === `${base}.pdf` ||
      (/^\d+_/.test(file.name) && file.name.endsWith(expectedSuffix));
  });
}

function nextId(files: DriveFile[]): string {
  let max = 0;
  for (const file of files) {
    const match = /^(\d+)_/.exec(file.name || "");
    if (match) max = Math.max(max, parseInt(match[1], 10));
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
    doi?: string;
  };
  const base = (body.base || "file")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";
  const sourceType = SOURCE_TYPES.has(body.sourceType || "") ? body.sourceType! : "other";
  const doi = normalizedDoi(body.doi);

  let token: string;
  try {
    token = await getDriveAccessToken();
  } catch (error) {
    return NextResponse.json(
      { error: `auth failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }

  try {
    const files = await listLibraryFiles(token);
    const duplicate = findDuplicate(files, base, doi);
    if (duplicate) {
      return NextResponse.json({
        existing: {
          id: duplicate.id,
          name: duplicate.name,
          link: duplicate.webViewLink || `https://drive.google.com/file/d/${duplicate.id}/view`,
        },
      });
    }

    const rootId = process.env.DRIVE_FOLDER_ID;
    const parentId = rootId
      ? await findOrCreateSubfolder(token, rootId, sourceType)
      : undefined;
    const name = `${nextId(files)}_${base}.pdf`;

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
        body: JSON.stringify({
          name,
          ...(parentId ? { parents: [parentId] } : {}),
          appProperties: {
            literatureKey: base,
            ...(doi ? { doi } : {}),
          },
        }),
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
      return NextResponse.json({ error: "Drive returned no resumable session URL." }, { status: 502 });
    }
    return NextResponse.json({ uploadUrl, name });
  } catch (error) {
    return NextResponse.json(
      { error: `Drive setup failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }
}
