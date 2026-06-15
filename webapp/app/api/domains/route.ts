import { NextRequest, NextResponse } from "next/server";
import { isGuest } from "@/lib/guest";
import { normalizeDomainId } from "@/lib/domain-registry";
import { readDomainRegistry, writeDomainRegistry } from "@/lib/domain-registry-server";
import { readTeam } from "@/lib/team";

export const runtime = "nodejs";

async function actorFor(username: string) {
  const { config } = await readTeam();
  return config.members.find((member) => member.id === username && member.active) || null;
}

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { registry } = await readDomainRegistry();
    if (isGuest(username)) {
      return NextResponse.json({ approved: registry.approved, proposals: [], demo: true });
    }
    const actor = await actorFor(username);
    if (!actor) return NextResponse.json({ error: "Account not found." }, { status: 403 });
    return NextResponse.json({
      approved: registry.approved,
      proposals: registry.proposals.filter(
        (proposal) => actor.role === "admin" || proposal.proposed_by === username,
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const body = (await req.json()) as {
    id?: string;
    label?: string;
    description?: string;
    reason?: string;
  };
  const id = normalizeDomainId(body.id || body.label);
  const label = String(body.label || "").trim().slice(0, 80);
  const description = String(body.description || "").trim().slice(0, 500);
  const reason = String(body.reason || "").trim().slice(0, 1000);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || label.length < 3 || reason.length < 10) {
    return NextResponse.json(
      { error: "Provide a kebab-case domain ID, a clear label, and a short justification." },
      { status: 400 },
    );
  }
  if (isGuest(username)) {
    return NextResponse.json({
      proposal: {
        id,
        label,
        description,
        reason,
        proposed_by: username,
        proposed_at: new Date().toISOString(),
        status: "pending",
      },
      demo: true,
    });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const actor = await actorFor(username);
      if (!actor) return NextResponse.json({ error: "Account not found." }, { status: 403 });
      const { registry, sha } = await readDomainRegistry();
      if (registry.approved.some((domain) => domain.id === id)) {
        return NextResponse.json({ error: "This domain is already approved." }, { status: 409 });
      }
      if (registry.proposals.some((proposal) => proposal.id === id && proposal.status === "pending")) {
        return NextResponse.json({ error: "This domain is already awaiting review." }, { status: 409 });
      }
      const proposal = {
        id,
        label,
        description,
        reason,
        proposed_by: username,
        proposed_at: new Date().toISOString(),
        status: "pending" as const,
      };
      registry.proposals.push(proposal);
      await writeDomainRegistry(registry, sha);
      return NextResponse.json({ proposal });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("(409)") || attempt === 2) {
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }
  }
  return NextResponse.json({ error: "Domain registry changed concurrently. Retry." }, { status: 409 });
}

export async function PATCH(req: NextRequest) {
  const username = req.headers.get("x-kb-user") || "";
  const body = (await req.json()) as { id?: string; action?: "approve" | "reject" };
  const id = normalizeDomainId(body.id);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id || !["approve", "reject"].includes(String(body.action))) {
    return NextResponse.json({ error: "A proposal ID and review action are required." }, { status: 400 });
  }
  if (isGuest(username)) {
    return NextResponse.json({ error: "Guest mode cannot review domain proposals." }, { status: 403 });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const actor = await actorFor(username);
      if (!actor || actor.role !== "admin") {
        return NextResponse.json({ error: "Only an administrator can review domains." }, { status: 403 });
      }
      const { registry, sha } = await readDomainRegistry();
      const proposal = registry.proposals.find(
        (item) => item.id === id && item.status === "pending",
      );
      if (!proposal) return NextResponse.json({ error: "Pending proposal not found." }, { status: 404 });
      const reviewedAt = new Date().toISOString();
      proposal.status = body.action === "approve" ? "approved" : "rejected";
      proposal.reviewed_by = username;
      proposal.reviewed_at = reviewedAt;
      if (body.action === "approve" && !registry.approved.some((domain) => domain.id === id)) {
        registry.approved.splice(Math.max(0, registry.approved.length - 1), 0, {
          id: proposal.id,
          label: proposal.label,
          description: proposal.description,
          created: reviewedAt.slice(0, 10),
          created_by: username,
        });
      }
      await writeDomainRegistry(registry, sha);
      return NextResponse.json({
        proposal,
        approved: registry.approved,
        deploy_required: body.action === "approve",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("(409)") || attempt === 2) {
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }
  }
  return NextResponse.json({ error: "Domain registry changed concurrently. Retry." }, { status: 409 });
}
