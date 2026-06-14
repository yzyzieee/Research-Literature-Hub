// Edge-safe signed team session helpers.

export const AUTH_COOKIE = "kb_session";
const SESSION_DAYS = 30;

function secret(): string {
  return process.env.AUTH_SECRET || process.env.APP_PASSWORD || "research-literature-hub-local-development";
}

async function signature(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function sessionToken(username: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const value = `${username}.${expires}`;
  return `${value}.${await signature(value)}`;
}

export async function sessionUser(token?: string): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expires, supplied] = parts;
  if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(username)) return null;
  if (!/^\d+$/.test(expires) || Number(expires) <= Math.floor(Date.now() / 1000)) return null;
  const expected = await signature(`${username}.${expires}`);
  return supplied === expected ? username : null;
}
