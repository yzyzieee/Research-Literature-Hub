import { GUEST_MEMBER, isGuest } from "./guest";
import { readTeam } from "./team";

export async function currentTeamMember(username: string) {
  if (isGuest(username)) return GUEST_MEMBER;
  const { config } = await readTeam();
  return config.members.find((member) => member.id === username && member.active) || null;
}
