import { NextRequest, NextResponse } from "next/server";
import { isGuest } from "@/lib/guest";
import { driveConfigured, getDriveAccessToken } from "@/lib/google";
import { readTeam } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DriveMetadata {
  id?: string;
  name?: string;
  mimeType?: string;
  size?: string;
  parents?: string[];
  appProperties?: Record<string, string>;
}

async function driveMetadata(id: string, token: string): Promise<DriveMetadata | null> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,size,parents,appProperties&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`metadata ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  return response.json();
}

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id || !/^[A-Za-z0-9_-]{8,}$/.test(id)) {
    return NextResponse.json({ error: "A valid Drive file ID is required." }, { status: 400 });
  }
  if (isGuest(username)) {
    return NextResponse.json({ error: "Private files are unavailable in guest mode." }, { status: 403 });
  }
  if (!driveConfigured()) {
    return NextResponse.json({ error: "Drive is not configured." }, { status: 501 });
  }

  try {
    const { config } = await readTeam();
    const actor = config.members.find((member) => member.id === username && member.active);
    if (!actor) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    const token = await getDriveAccessToken();
    const metadata = await driveMetadata(id, token);
    if (!metadata) return NextResponse.json({ error: "Drive file not found." }, { status: 404 });
    const rootId = process.env.DRIVE_FOLDER_ID;
    if (
      !metadata.appProperties?.literatureKey &&
      !(rootId && metadata.parents?.includes(rootId))
    ) {
      return NextResponse.json({ error: "This file is outside the literature archive." }, { status: 403 });
    }

    const range = req.headers.get("range");
    const media = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(range ? { Range: range } : {}),
        },
        cache: "no-store",
      },
    );
    if (!media.ok && media.status !== 206) {
      throw new Error(`download ${media.status}: ${(await media.text()).slice(0, 200)}`);
    }
    const headers = new Headers();
    headers.set("Content-Type", metadata.mimeType || media.headers.get("content-type") || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${(metadata.name || "file").replaceAll('"', "")}"`);
    headers.set("Cache-Control", "private, max-age=3600");
    headers.set("Accept-Ranges", "bytes");
    for (const name of ["content-length", "content-range"]) {
      const value = media.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(media.body, { status: media.status, headers });
  } catch (error) {
    return NextResponse.json(
      { error: `Drive read failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const { id } = (await req.json()) as { id?: string };
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id || !/^[A-Za-z0-9_-]{8,}$/.test(id)) {
    return NextResponse.json({ error: "A valid Drive file ID is required." }, { status: 400 });
  }
  if (isGuest(username)) return NextResponse.json({ deleted: true, demo: true });
  if (!driveConfigured()) {
    return NextResponse.json({ error: "Drive is not configured." }, { status: 501 });
  }

  try {
    const token = await getDriveAccessToken();
    const metadata = await driveMetadata(id, token);
    if (!metadata) return NextResponse.json({ deleted: true, missing: true });
    if (!metadata.appProperties?.literatureKey) {
      return NextResponse.json(
        { error: "This file was not archived by the literature app." },
        { status: 403 },
      );
    }
    const { config } = await readTeam();
    const actor = config.members.find((member) => member.id === username && member.active);
    const uploadedBy = metadata.appProperties.uploadedBy || "";
    const collaborativeFigure = metadata.appProperties.assetKind === "keyFigure";
    if (!actor || (!collaborativeFigure && actor.role !== "admin" && uploadedBy !== username)) {
      return NextResponse.json(
        { error: "Only the original uploader or an administrator can delete this archived file." },
        { status: 403 },
      );
    }

    const deletion = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?supportsAllDrives=true`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!deletion.ok && deletion.status !== 404) {
      throw new Error(`delete ${deletion.status}: ${(await deletion.text()).slice(0, 200)}`);
    }
    return NextResponse.json({ deleted: true, name: metadata.name || "" });
  } catch (error) {
    return NextResponse.json(
      { error: `Drive delete failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }
}
