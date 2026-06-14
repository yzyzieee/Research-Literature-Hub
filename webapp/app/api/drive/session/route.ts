import { NextRequest, NextResponse } from "next/server";
import { GUEST_MEMBER, isGuest } from "@/lib/guest";
import { driveConfigured, getDriveAccessToken } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DriveFile {
  id: string;
  name: string;
  parents?: string[];
  webViewLink?: string;
  appProperties?: Record<string, string>;
}

function normalizedDoi(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

async function listLibraryFiles(token: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      q: "trashed=false and mimeType!='application/vnd.google-apps.folder'",
      pageSize: "1000",
      fields: "nextPageToken,files(id,name,parents,webViewLink,appProperties)",
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
  const normalizedBase = base.toLowerCase();
  const expectedSuffix = `_${normalizedBase}.pdf`;
  return files.find((file) => {
    const fileDoi = normalizedDoi(file.appProperties?.doi);
    if (doi && fileDoi && fileDoi === doi) return true;
    const fileName = file.name.toLowerCase();
    return file.appProperties?.literatureKey?.toLowerCase() === normalizedBase ||
      fileName === `${normalizedBase}.pdf` ||
      (/^\d+_/.test(fileName) && fileName.endsWith(expectedSuffix));
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
  const body = (await req.json()) as {
    base?: string;
    mimeType?: string;
    size?: number;
    doi?: string;
  };
  const base = (body.base || "file")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";
  const doi = normalizedDoi(body.doi);
  const username = req.headers.get("x-kb-user") || "unknown";
  const uploadedAt = new Date().toISOString();
  if (isGuest(username)) {
    return NextResponse.json({
      demo: {
        id: `guest-${Date.now().toString(36)}`,
        name: `DEMO_${base}.pdf`,
        link: "/new#guest-demo-pdf",
        uploadedBy: GUEST_MEMBER.id,
        uploadedAt,
      },
    });
  }
  if (!driveConfigured()) {
    return NextResponse.json(
      { error: "Drive upload not configured (set owner OAuth or a service-account key)." },
      { status: 501 },
    );
  }

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
    const rootId = process.env.DRIVE_FOLDER_ID;
    const visibleFiles = await listLibraryFiles(token);
    const files = visibleFiles.filter(
      (file) => Boolean(file.appProperties?.literatureKey) ||
        Boolean(rootId && file.parents?.includes(rootId)),
    );
    const duplicate = findDuplicate(files, base, doi);
    if (duplicate) {
      return NextResponse.json({
        existing: {
          id: duplicate.id,
          name: duplicate.name,
          link: duplicate.webViewLink || `https://drive.google.com/file/d/${duplicate.id}/view`,
          uploadedBy: duplicate.appProperties?.uploadedBy || "unknown",
          uploadedAt: duplicate.appProperties?.uploadedAt || "",
        },
      });
    }

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
          ...(rootId ? { parents: [rootId] } : {}),
          appProperties: {
            literatureKey: base,
            uploadedBy: username,
            uploadedAt,
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
    return NextResponse.json({ uploadUrl, name, uploadedBy: username, uploadedAt });
  } catch (error) {
    return NextResponse.json(
      { error: `Drive setup failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }
}
