import { get, head, put } from "@vercel/blob";
import { cache } from "react";

/* ---------------------------------------------------------------------------
   Blob record store — the one storage pattern behind notes, posts, page
   copy, and subscribers: a single JSON document of `id -> entry` in the
   project's private Vercel Blob store, merged over static defaults at
   render time.

   Reads go straight to Blob on every request — deliberately uncached. Two
   cache layers have each served stale documents right after a save (Blob's
   CDN for up to a minute, and Next's tagged data cache when invalidation
   didn't propagate across instances), which surfaced as "my edit reverted".
   The documents are tiny and traffic is low; one Blob round trip per render
   is the price of always reading your writes.
   Server-side only.
   ------------------------------------------------------------------------- */

export function blobRecordStore<T>(path: string): {
  read: () => Promise<Record<string, T>>;
  write: (id: string, entry: T | null) => Promise<void>;
} {
  // Fetch the latest document. Blob's CDN can serve a just-overwritten copy
  // for up to ~a minute; a unique query param on the blob URL skips that
  // cache, so this always returns the latest write.
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

  // Deduped within a single render pass (page + metadata + nested
  // components share one fetch), never cached across requests.
  const read = cache(fetchDocument);

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
  };

  return { read, write };
}
