import type { Post } from "@/lib/writing";

/* ---------------------------------------------------------------------------
   The inline post editor's working shape + pure helpers (client-safe).
   ------------------------------------------------------------------------- */

// Every editable field, always present (empty string = cleared). The
// `updatePost` action validates and stores it.
export type PostDraft = {
  slug: string;
  title: string;
  date: string;
  tagline: string;
  thumbnail: string;
  // Banner crop focal point, 0–100 (50 = center).
  thumbnailY: number;
  body: string;
  // false = published (visible to everyone), true = only the owner sees it.
  draft: boolean;
};

export function draftFrom(post: Post): PostDraft {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tagline: post.tagline,
    thumbnail: post.thumbnail ?? "",
    thumbnailY: post.thumbnailY ?? 50,
    body: post.body,
    draft: post.draft ?? false,
  };
}
