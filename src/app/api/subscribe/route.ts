import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/record-store";
import { addSubscriber } from "@/lib/subscriber-store";

// Basic shape check to avoid storing obviously bad addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_BODY_BYTES = 4096;
let limiter: Ratelimit | null = null;

function subscribeLimiter(): Ratelimit {
  limiter ??= new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "ratelimit:subscribe",
  });
  return limiter;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Invalid request." }, { status: 413 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  try {
    const result = await subscribeLimiter().limit(ip);
    if (!result.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000),
      );
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Couldn't save your subscription. Try again." },
      { status: 503 },
    );
  }

  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof email !== "string" ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_RE.test(email.trim())
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const added = await addSubscriber(email);
    return NextResponse.json({ ok: true, alreadySubscribed: !added });
  } catch {
    return NextResponse.json(
      { error: "Couldn't save your subscription. Try again." },
      { status: 500 },
    );
  }
}
