import { get, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";

/* ---------------------------------------------------------------------------
   Blob record store — the one storage pattern behind notes, posts, page
   copy, and subscribers: a single JSON document of `id -> entry` in the
   project's private Vercel Blob store, merged over static defaults at
   render time.
   Server-side only.
   ------------------------------------------------------------------------- */

// Blob reads go through a CDN cache, so an overwrite can serve stale content
// for up to ~a minute. Keep edits read-your-writes on the instance that made
// them by preferring the latest written document until the CDN converges.
const CDN_CONVERGE_MS = 2 * 60 * 1000;

// Reads are cached across requests (visitors don't pay a Blob round trip per
// page view); a write invalidates the tag. The revalidate window is a
// self-heal: if a revalidation lands while the Blob CDN is still serving the
// pre-write copy, the stale entry expires on its own shortly after.
const READ_REVALIDATE_S = 300;

export function blobRecordStore<T>(path: string): {
  read: () => Promise<Record<string, T>>;
  write: (id: string, entry: T | null) => Promise<void>;
} {
  let lastWrite: { value: Record<string, T>; at: number } | null = null;
  const tag = `blob:${path}`;

  // Uncached fetch straight from Blob — the cache's loader, and what writes
  // use for their read-modify-write so they never act on a stale cache entry.
  const fetchDocument = async (): Promise<Record<string, T>> => {
    try {
      const result = await get(path, { access: "private" });
      if (!result?.stream) return {};
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as Record<string, T>;
    } catch {
      // Missing blob (first run) or a transient read failure: fall back to
      // the static defaults rather than breaking the page.
      return {};
    }
  };

  const readCached = unstable_cache(fetchDocument, [tag], {
    tags: [tag],
    revalidate: READ_REVALIDATE_S,
  });

  const read = async (): Promise<Record<string, T>> => {
    if (lastWrite && Date.now() - lastWrite.at < CDN_CONVERGE_MS) {
      return lastWrite.value;
    }
    return readCached();
  };

  // `null` deletes the entry — reverting that id to its static default.
  const write = async (id: string, entry: T | null): Promise<void> => {
    const base =
      lastWrite && Date.now() - lastWrite.at < CDN_CONVERGE_MS
        ? lastWrite.value
        : await fetchDocument();
    const value = { ...base };
    if (entry) value[id] = entry;
    else delete value[id];
    await put(path, JSON.stringify(value, null, 2), {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
      cacheControlMaxAge: 60, // the minimum Blob allows
    });
    lastWrite = { value, at: Date.now() };
    revalidateTag(tag, "max");
  };

  return { read, write };
}
