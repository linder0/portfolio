import { Redis } from "@upstash/redis";
import { cache } from "react";

/* ---------------------------------------------------------------------------
   Record store — the one storage pattern behind notes, posts, comments, page
   copy, and subscribers: a `id -> entry` map merged over static defaults at
   render time.

   Backed by Upstash Redis (one hash per store), not Vercel Blob: Blob is a
   CDN-cached object store, so reading a document back right after a save could
   return a stale copy for up to a minute (its cache can't be bypassed on read
   in @vercel/blob 2.x), and a shared JSON document had a read-modify-write
   race between concurrent writers. Redis fixes both for good — reads are
   strongly consistent (read-your-writes with no snapshot tricks) and each
   entry is its own hash field, so writes are atomic per field (`HSET`/`HDEL`)
   and can't clobber a concurrent write to a different entry.

   Blob is still used for uploaded images (see `lib/images`), which is what
   object storage is actually for.
   Server-side only.
   ------------------------------------------------------------------------- */

let client: Redis | null = null;

// Lazy so `next build` doesn't crash evaluating module code before the Upstash
// env vars are provisioned. The Vercel Marketplace Upstash integration injects
// either UPSTASH_REDIS_REST_* or KV_REST_API_* (legacy KV naming) depending on
// how the store was created — accept both so provisioning just works.
function redis(): Redis {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis env vars (UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN).",
    );
  }
  client = new Redis({ url, token });
  return client;
}

export function recordStore<T>(key: string): {
  read: () => Promise<Record<string, T>>;
  write: (id: string, entry: T | null) => Promise<void>;
} {
  // Deduped within a single render pass (page + metadata + nested components
  // share one round trip). Redis reads are strongly consistent, so no caching
  // beyond that is needed. An empty/missing hash reads as no entries.
  const read = cache(async (): Promise<Record<string, T>> => {
    const all = await redis().hgetall<Record<string, T>>(key);
    return all ?? {};
  });

  // `null` deletes the entry — reverting that id to its static default. Each
  // write touches only its own field, so concurrent writes to different ids
  // never conflict.
  const write = async (id: string, entry: T | null): Promise<void> => {
    if (entry) await redis().hset(key, { [id]: entry });
    else await redis().hdel(key, id);
  };

  return { read, write };
}
