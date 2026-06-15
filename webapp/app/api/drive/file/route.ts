import { NextRequest, NextResponse } from "next/server";
import { isGuest } from "@/lib/guest";
import { driveConfigured, getDriveAccessToken } from "@/lib/google";
import { readTeam } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DriveMetadata {
  id?: string;
  name?: string;
  appProperties?: Record<string, string>;
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
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,appProperties&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    if (metadataResponse.status === 404) return NextResponse.json({ deleted: true, missing: true });
    if (!metadataResponse.ok) {
      throw new Error(
        `metadata ${metadataResponse.status}: ${(await metadataResponse.text()).slice(0, 200)}`,
      );
    }
    const metadata = (await metadataResponse.json()) as DriveMetadata;
    if (!metadata.appProperties?.literatureKey) {
      return NextResponse.json(
        { error: "This file was not archived by the literature app." },
        { status: 403 },
      );
    }
    const { config } = await readTeam();
    const actor = config.members.find((member) => member.id === username && member.active);
    const uploadedBy = metadata.appProperties.uploadedBy || "";
    if (!actor || (actor.role !== "admin" && uploadedBy !== username)) {
      return NextResponse.json(
        { error: "Only the original uploader or an administrator can delete this PDF." },
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
