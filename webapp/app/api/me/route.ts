import { NextRequest, NextResponse } from "next/server";
import { GUEST_MEMBER, isGuest } from "@/lib/guest";
import { readTeam } from "@/lib/team";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-kb-user");
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isGuest(username)) return NextResponse.json({ member: GUEST_MEMBER, demo: true });
  try {
    const { config } = await readTeam();
    const member = config.members.find((item) => item.id === username && item.active);
    if (!member) return NextResponse.json({ error: "Account is inactive or missing." }, { status: 403 });
    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
