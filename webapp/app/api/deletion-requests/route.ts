import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { currentTeamMember } from "@/lib/current-member";
import { isGuest } from "@/lib/guest";
import {
  decodeGitHubFile,
  deleteGitHubFile,
  readGitHubFile,
} from "@/lib/github-content";
import { deleteDriveKeyFigure } from "@/lib/google";
import { parseKeyFigure } from "@/lib/key-figure";
import {
  readDeletionRequests,
  writeDeletionRequests,
} from "@/lib/deletion-requests-server";

export const runtime = "nodejs";

function validSlug(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value);
}

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const slug = String(req.nextUrl.searchParams.get("slug") || "").trim();
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const member = await currentTeamMember(username);
    if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    if (isGuest(username)) return NextResponse.json({ requests: [], demo: true });
    const { registry } = await readDeletionRequests();
    const requests = registry.requests.filter((request) => {
      if (slug && request.slug !== slug) return false;
      return member.role === "admin" || request.requested_by === member.id;
    });
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const body = (await req.json()) as { slug?: string; reason?: string };
  const slug = String(body.slug || "").trim();
  const reason = String(body.reason || "").trim().slice(0, 500);
  if (!username || !validSlug(slug) || reason.length < 5) {
    return NextResponse.json(
      { error: "A valid card and a brief reason of at least 5 characters are required." },
      { status: 400 },
    );
  }
  try {
    const member = await currentTeamMember(username);
    if (!member) return NextResponse.json({ error: "Team account not found." }, { status: 403 });
    if (isGuest(username)) {
      return NextResponse.json({
        request: {
          id: `GUEST-${Date.now().toString(36)}`,
          slug,
          title: slug,
          requested_by: username,
          reason,
          requested_at: new Date().toISOString(),
          status: "pending",
        },
        demo: true,
      });
    }
    const cardFile = await readGitHubFile(
      `official/${slug}.md`,
      "Card not found in the official library.",
    );
    const card = matter(decodeGitHubFile(cardFile));
    const creator = String(card.data.uploaded_by || "").toUpperCase();
    if (member.role === "admin" || creator === member.id.toUpperCase()) {
      return NextResponse.json(
        { error: "You can delete this card directly; no approval request is needed." },
        { status: 409 },
      );
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const { registry, sha } = await readDeletionRequests();
        const existing = registry.requests.find(
          (request) =>
            request.slug === slug &&
            request.requested_by === member.id &&
            request.status === "pending",
        );
        if (existing) {
          return NextResponse.json(
            { error: "You already have a pending deletion request for this card.", request: existing },
            { status: 409 },
          );
        }
        const request = {
          id: `${member.id}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
          slug,
          title: String(card.data.title || slug).slice(0, 300),
          requested_by: member.id,
          reason,
          requested_at: new Date().toISOString(),
          status: "pending" as const,
        };
        registry.requests.push(request);
        await writeDeletionRequests(registry, sha);
        return NextResponse.json({ request });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("(409)") || attempt === 2) {
          throw error;
        }
      }
    }
    return NextResponse.json(
      { error: "Deletion requests changed concurrently. Retry." },
      { status: 409 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: message.includes("not found") ? 404 : 502 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const body = (await req.json()) as {
    id?: string;
    action?: "approve" | "reject";
  };
  const id = String(body.id || "").trim();
  const action = body.action;
  if (!username || !id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      { error: "A request ID and review action are required." },
      { status: 400 },
    );
  }
  try {
    const member = await currentTeamMember(username);
    if (!member || member.role !== "admin" || isGuest(username)) {
      return NextResponse.json(
        { error: "Only an administrator can review deletion requests." },
        { status: 403 },
      );
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const { registry, sha } = await readDeletionRequests();
        const request = registry.requests.find(
          (item) => item.id === id && item.status === "pending",
        );
        if (!request) {
          return NextResponse.json({ error: "Pending deletion request not found." }, { status: 404 });
        }
        let keyFigureRef = "";
        if (action === "approve") {
          try {
            const cardFile = await readGitHubFile(
              `official/${request.slug}.md`,
              "Card not found in the official library.",
            );
            keyFigureRef =
              parseKeyFigure(matter(decodeGitHubFile(cardFile)).data.key_figure).image_ref || "";
            await deleteGitHubFile({
              path: `official/${request.slug}.md`,
              sha: cardFile.sha,
              message: `literature: approve deletion of ${request.slug} by ${member.id}`,
            });
          } catch (error) {
            if (!(error instanceof Error) || !error.message.includes("not found")) throw error;
          }
        }
        request.status = action === "approve" ? "approved" : "rejected";
        request.reviewed_by = member.id;
        request.reviewed_at = new Date().toISOString();
        await writeDeletionRequests(registry, sha);
        let keyFigureDeleted = false;
        if (action === "approve" && keyFigureRef) {
          try {
            keyFigureDeleted = await deleteDriveKeyFigure(keyFigureRef);
          } catch (error) {
            console.warn(`Key Figure cleanup failed for ${request.slug}:`, error);
          }
        }
        return NextResponse.json({
          request,
          deleted: action === "approve",
          pdf_preserved: action === "approve",
          key_figure_deleted: keyFigureDeleted,
          deploy_pending: true,
        });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("(409)") || attempt === 2) {
          throw error;
        }
      }
    }
    return NextResponse.json(
      { error: "Deletion requests changed concurrently. Retry." },
      { status: 409 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
