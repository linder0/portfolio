import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/subscriber-store";

// Basic shape check to avoid storing obviously bad addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
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
