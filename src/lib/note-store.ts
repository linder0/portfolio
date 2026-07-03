import type { StoredNote } from "@/lib/notes";
import { blobRecordStore } from "@/lib/blob-store";

/* ---------------------------------------------------------------------------
   Note store — owner-edited marginalia, keyed by note id (e.g.
   "project:hangful", "bio:2"), merged over static defaults at render time.
   Server-side only. (Photos embedded in notes share the post-image storage —
   see `lib/images` and `components/use-image-upload`.)
   ------------------------------------------------------------------------- */

export type StoredNotes = Record<string, StoredNote>;

const store = blobRecordStore<StoredNote>("content/notes.json");

export const getStoredNotes = store.read;

// Clearing every field (null) reverts a note to its default.
export const saveStoredNote = store.write;
