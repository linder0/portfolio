import { blobRecordStore } from "@/lib/blob-store";

/* ---------------------------------------------------------------------------
   Subscriber store — newsletter signups, keyed by normalized email address.
   Server-side only.
   ------------------------------------------------------------------------- */

export type Subscriber = {
  subscribedAt: string; // ISO timestamp
};

const store = blobRecordStore<Subscriber>("content/subscribers.json");

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getSubscribers(): Promise<Record<string, Subscriber>> {
  return store.read();
}

/** Returns false if the address was already on the list. */
export async function addSubscriber(email: string): Promise<boolean> {
  const key = normalizeEmail(email);
  const existing = await store.read();
  if (existing[key]) return false;
  await store.write(key, { subscribedAt: new Date().toISOString() });
  return true;
}
