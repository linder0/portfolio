import { anchorIndex } from "@/lib/notes";

/* ---------------------------------------------------------------------------
   Visitor comments — anyone can select a phrase in a post and pin a comment
   to it with just a name (no accounts; the owner can delete anything).
   Comments reuse the highlight-anchoring convention from `lib/notes`: the
   exact selected text plus normalized surrounding context, so the comment
   pins to that one occurrence. Stored in Blob keyed by comment id (see
   `lib/comment-store`); client-safe types and pure helpers live here.
   ------------------------------------------------------------------------- */

export type StoredComment = {
  // The post's stable id (`Post.id`), not its slug — slugs can change.
  postId: string;
  anchor: string;
  prefix?: string;
  suffix?: string;
  name: string;
  body: string;
  // ISO timestamp, set by the server on save.
  createdAt: string;
};

// What the margin panel shows for one comment.
export type CommentDisplay = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
};

export const COMMENT_NAME_MAX = 40;
export const COMMENT_BODY_MAX = 2000;
export const COMMENT_ANCHOR_MAX = 500;

// The comments that pin somewhere inside `text`, grouped by target (several
// people commenting on the same phrase share one underline), in order of
// appearance, oldest comment first within a group. Overlap against owner
// highlights is resolved by the caller (AnnotatedText), which merges both
// kinds into one non-overlapping list.
export function commentGroupsIn(
  text: string,
  comments: Record<string, StoredComment>,
): { anchor: string; index: number; comments: CommentDisplay[] }[] {
  const groups = new Map<
    string,
    { anchor: string; index: number; comments: CommentDisplay[] }
  >();
  for (const [id, comment] of Object.entries(comments)) {
    if (!comment.anchor) continue;
    const key = `${comment.prefix ?? ""}\u241f${comment.anchor}\u241f${comment.suffix ?? ""}`;
    let group = groups.get(key);
    if (!group) {
      const index = anchorIndex(text, comment);
      if (index === -1) continue;
      group = { anchor: comment.anchor, index, comments: [] };
      groups.set(key, group);
    }
    group.comments.push({
      id,
      name: comment.name,
      body: comment.body,
      createdAt: comment.createdAt,
    });
  }
  for (const group of groups.values()) {
    group.comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return Array.from(groups.values()).sort((a, b) => a.index - b.index);
}

// "2026-07-15T22:00:00.000Z" -> "July 15, 2026".
export function formatCommentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
