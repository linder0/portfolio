import { recordStore } from "@/lib/record-store";

/* ---------------------------------------------------------------------------
   Page store — owner-edited page copy (e.g. the home bio), keyed by page id,
   merged over the static default at render time. Server-side only.
   ------------------------------------------------------------------------- */

export type StoredPage = { body?: string };
export type StoredPages = Record<string, StoredPage>;

const store = recordStore<StoredPage>("pages");

export const getStoredPages = store.read;

// A null entry reverts the page to its code-defined default.
export const saveStoredPage = store.write;
