import type { StoredComment } from "@/lib/comments";
import { recordStore } from "@/lib/record-store";

/* ---------------------------------------------------------------------------
   Comment store — visitor comments, keyed by comment id (`comment:<random>`),
   all posts sharing one Redis hash (see `lib/record-store`); each comment is
   its own field, so concurrent adds/deletes never conflict.
   Server-side only.
   ------------------------------------------------------------------------- */

const store = recordStore<StoredComment>("comments");

export const getStoredComments = store.read;

// `null` deletes the comment.
export const saveStoredComment = store.write;

// One post's comments, still keyed by comment id.
export async function getPostComments(
  postId: string,
): Promise<Record<string, StoredComment>> {
  const all = await getStoredComments();
  return Object.fromEntries(
    Object.entries(all).filter(([, comment]) => comment.postId === postId),
  );
}
