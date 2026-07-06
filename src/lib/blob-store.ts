import { get, head, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";

/* ---------------------------------------------------------------------------
   Blob record store — the one storage pattern behind notes, posts, page
   copy, and subscribers: a single JSON document of `id -> entry` in the
   project's private Vercel Blob store, merged over static defaults at
   render time.
   Server-side only.
   ------------------------------------------------------------------------- */

// Reads are cached across requests (visitors don't pay a Blob round trip per
// page view); a write expires the tag immediately so the next render reads
// the fresh document. The revalidate window is just a periodic self-heal.
const READ_REVALIDATE_S = 300;

export function blobRecordStore<T>(path: string): {
  read: () => Promise<Record<string, T>>;
  write: (id: string, entry: T | null) => Promise<void>;
} {
  const tag = `blob:${path}`;

  // Uncached fetch straight from Blob. Plain reads go through Blob's CDN,
  // which can serve a just-overwritten document for up to ~a minute; a
  // unique query param on the blob URL skips that cache, so this always
  // returns the latest write.
  const fetchDocument = async (): Promise<Record<string, T>> => {
    try {
      const { url } = await head(path);
      const result = await get(`${url}?fresh=${Date.now()}`, {
        access: "private",
      });
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

  const read = (): Promise<Record<string, T>> => readCached();

  // `null` deletes the entry — reverting that id to its static default.
  const write = async (id: string, entry: T | null): Promise<void> => {
    const value = { ...(await fetchDocument()) };
    if (entry) value[id] = entry;
    else delete value[id];
    await put(path, JSON.stringify(value, null, 2), {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
      cacheControlMaxAge: 60, // the minimum Blob allows
    });
    // Expire immediately — `"max"` would serve the stale pre-write document
    // on the next read, which is exactly the "my edits reverted" bug.
    // (`updateTag` does the same but only works in server actions, and the
    // subscribe route handler also writes through here.)
    revalidateTag(tag, { expire: 0 });
  };

  return { read, write };
}
