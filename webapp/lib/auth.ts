// Shared, edge-safe auth helpers. Works in both Next.js middleware (edge
// runtime) and node API routes via the global Web Crypto API.

export const AUTH_COOKIE = "kb_auth";
const SALT = "audio-research-kb/v1";

/** Derive an opaque cookie token from the shared password. */
export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
