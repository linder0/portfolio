import { getRedis, recordStore } from "@/lib/record-store";

/* ---------------------------------------------------------------------------
   Subscriber store — newsletter signups, keyed by normalized email address.
   Server-side only.
   ------------------------------------------------------------------------- */

export type Subscriber = {
  subscribedAt: string; // ISO timestamp
};

const store = recordStore<Subscriber>("subscribers");
const MAX_SUBSCRIBERS = 10_000;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getSubscribers(): Promise<Record<string, Subscriber>> {
  return store.read();
}

/** Returns false if the address was already on the list. */
export async function addSubscriber(email: string): Promise<boolean> {
  const key = normalizeEmail(email);
  const redis = getRedis();
  if ((await redis.hlen("subscribers")) >= MAX_SUBSCRIBERS) {
    throw new Error("Subscriber limit reached");
  }
  const added = await redis.hsetnx(
    "subscribers",
    key,
    { subscribedAt: new Date().toISOString() },
  );
  return added === 1;
}
