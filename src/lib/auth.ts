import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* ---------------------------------------------------------------------------
   Single-owner auth. No accounts or session store: logging in with the admin
   password sets an HTTP-only cookie holding `expiry.signature`, where the
   signature is an HMAC of the expiry under AUTH_SECRET. Only the server can
   mint a valid token, so possession of one proves "this is Linda".
   Server-side only — never import from a client component.
   ------------------------------------------------------------------------- */

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const expiry = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expiry}.${sign(expiry)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (!safeEqual(signature, sign(expiry))) return false;
  return Number(expiry) > Date.now();
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

// Constant-time password check (hash both sides so lengths never leak).
export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const hash = (s: string) => createHmac("sha256", secret()).update(s).digest("hex");
  return safeEqual(hash(candidate), hash(expected));
}
