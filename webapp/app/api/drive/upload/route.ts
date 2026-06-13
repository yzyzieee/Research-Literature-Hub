import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validDriveUploadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "www.googleapis.com" &&
      url.pathname.startsWith("/upload/drive/");
  } catch {
    return false;
  }
}

export async function PUT(req: NextRequest) {
  const uploadUrl = req.headers.get("x-drive-upload-url") || "";
  const contentRange = req.headers.get("content-range") || "";

  if (!validDriveUploadUrl(uploadUrl) || !/^bytes \d+-\d+\/\d+$/.test(contentRange)) {
    return NextResponse.json({ error: "Invalid Drive upload session or byte range." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await req.arrayBuffer());
    if (!bytes.length) {
      return NextResponse.json({ error: "Upload chunk is empty." }, { status: 400 });
    }

    const uploaded = await fetch(uploadUrl, {
      method: "PUT",
      redirect: "manual",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/pdf",
        "Content-Length": String(bytes.length),
        "Content-Range": contentRange,
      },
      body: bytes,
    });

    if (uploaded.status === 308) {
      return NextResponse.json({
        complete: false,
        received: uploaded.headers.get("range") || "",
      });
    }

    if (!uploaded.ok) {
      return NextResponse.json(
        { error: `Drive upload ${uploaded.status}: ${(await uploaded.text()).slice(0, 300)}` },
        { status: 502 },
      );
    }

    const file = (await uploaded.json()) as { id?: string; webViewLink?: string };
    if (!file.id) {
      return NextResponse.json({ error: "Drive completed the upload without a file ID." }, { status: 502 });
    }
    return NextResponse.json({
      complete: true,
      id: file.id,
      link: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Drive proxy failed: ${error instanceof Error ? error.message : error}` },
      { status: 502 },
    );
  }
}
