import { NextRequest, NextResponse } from "next/server";
import { GUEST_MEMBER, isGuest } from "@/lib/guest";
import { DOMAINS } from "@/lib/types";
import { readTeam, writeTeam } from "@/lib/team";

export const runtime = "nodejs";

function validDomains(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const domains = [...new Set(value.map(String))];
  return domains.every((domain) => DOMAINS.includes(domain)) ? domains : null;
}

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-kb-user");
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { config } = await readTeam();
    if (isGuest(username)) {
      return NextResponse.json({
        member: GUEST_MEMBER,
        members: config.members.filter((item) => item.active),
        demo: true,
      });
    }
    const member = config.members.find((item) => item.id === username && item.active);
    if (!member) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    return NextResponse.json({
      member,
      members: config.members.filter((item) => item.active),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest) {
  const username = req.headers.get("x-kb-user");
  const body = (await req.json()) as { name?: string; domains?: string[] };
  const name = String(body.name || "").trim().slice(0, 60);
  const rawDomains = body.domains;
  const domains = validDomains(rawDomains);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!name) return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  if (!domains) return NextResponse.json({ error: "Invalid research domains." }, { status: 400 });
  if (isGuest(username)) {
    return NextResponse.json({
      member: { ...GUEST_MEMBER, name, domains },
      demo: true,
    });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { config, sha } = await readTeam();
      const member = config.members.find((item) => item.id === username && item.active);
      if (!member) return NextResponse.json({ error: "Account not found." }, { status: 404 });
      member.name = name;
      member.domains = domains;
      await writeTeam(config, sha);
      return NextResponse.json({ member });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("(409)") || attempt === 2) {
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }
  }
  return NextResponse.json({ error: "Member settings changed concurrently. Retry." }, { status: 409 });
}

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-kb-user");
  const body = (await req.json()) as { id?: string; name?: string };
  const id = String(body.id || "").trim().toUpperCase();
  const name = String(body.name || id).trim().slice(0, 60);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isGuest(username)) {
    return NextResponse.json(
      { error: "Guest mode cannot create team accounts." },
      { status: 403 },
    );
  }
  if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(id) || !name) {
    return NextResponse.json({ error: "Use a 2-32 character account ID and display name." }, { status: 400 });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { config, sha } = await readTeam();
      const actor = config.members.find((item) => item.id === username && item.active);
      if (!actor || actor.role !== "admin") {
        return NextResponse.json({ error: "Only a team administrator can add accounts." }, { status: 403 });
      }
      if (config.members.some((member) => member.id === id)) {
        return NextResponse.json({ error: `Account ${id} already exists.` }, { status: 409 });
      }
      const member = {
        id,
        name,
        role: "member" as const,
        domains: [],
        active: true,
        created: new Date().toISOString().slice(0, 10),
      };
      config.members.push(member);
      await writeTeam(config, sha);
      return NextResponse.json({ member, members: config.members });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("(409)") || attempt === 2) {
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }
  }
  return NextResponse.json({ error: "Member registry changed concurrently. Retry." }, { status: 409 });
}
