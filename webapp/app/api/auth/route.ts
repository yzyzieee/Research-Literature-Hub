import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, sessionToken } from "@/lib/auth";
import { activeMembers, readTeam } from "@/lib/team";

export const runtime = "nodejs";

function allowedAccounts(): Set<string> {
  const configured = process.env.LOGIN_ALLOWED_ACCOUNTS || "YZY";
  return new Set(
    configured
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );
}

export async function GET() {
  return NextResponse.json({ login: "manual" });
}

export async function POST(req: NextRequest) {
  const { username: raw } = (await req.json()) as { username?: string };
  const username = String(raw || "").trim().toUpperCase();
  try {
    const { config } = await readTeam();
    const member = activeMembers(config).find(
      (item) => item.id === username && allowedAccounts().has(item.id),
    );
    if (!member) {
      return NextResponse.json({ error: "unknown account" }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      member,
      needs_setup: member.domains.length === 0,
    });
    response.cookies.set(AUTH_COOKIE, await sessionToken(member.id), {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
