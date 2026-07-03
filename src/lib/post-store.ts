import { put } from "@vercel/blob";
import { posts as staticPosts, type Post } from "@/lib/writing";
import { blobRecordStore } from "@/lib/blob-store";

/* ---------------------------------------------------------------------------
   Post store — owner-edited posts, keyed by post id.

   Posts resolve in two layers:
   - Static posts in `lib/writing` are the seed defaults. A stored entry with
     the same id overrides individual fields (a missing field falls back to
     the default; `deleted: true` hides the post entirely).
   - Stored entries whose id matches no static post are posts created inline
     from the site; they live wholly in Blob.
   Server-side only.
   ------------------------------------------------------------------------- */

export type StoredPost = {
  slug?: string;
  title?: string;
  date?: string;
  tagline?: string;
  // Empty string means "cleared" (a static default thumbnail removed).
  thumbnail?: string;
  // Banner crop focal point (see `thumbnailY` on Post in `lib/writing`).
  thumbnailY?: number;
  body?: string;
  // Owner-only visibility (see `draft` on Post in `lib/writing`).
  draft?: boolean;
  // Hides a static post; a created post is deleted by removing its entry.
  deleted?: boolean;
};
export type StoredPosts = Record<string, StoredPost>;

const store = blobRecordStore<StoredPost>("content/posts.json");

export const getStoredPosts = store.read;
export const saveStoredPost = store.write;

function mergePost(base: Post, stored?: StoredPost): Post {
  if (!stored) return base;
  return {
    ...base,
    slug: stored.slug ?? base.slug,
    title: stored.title ?? base.title,
    date: stored.date ?? base.date,
    tagline: stored.tagline ?? base.tagline,
    thumbnail:
      stored.thumbnail !== undefined
        ? stored.thumbnail || undefined
        : base.thumbnail,
    thumbnailY: stored.thumbnailY ?? base.thumbnailY,
    body: stored.body ?? base.body,
    draft: stored.draft ?? base.draft,
  };
}

function storedToPost(id: string, stored: StoredPost): Post {
  return {
    id,
    slug: stored.slug ?? id,
    title: stored.title ?? "Untitled",
    date: stored.date ?? "1970-01-01",
    tagline: stored.tagline ?? "",
    thumbnail: stored.thumbnail || undefined,
    thumbnailY: stored.thumbnailY,
    body: stored.body ?? "",
    draft: stored.draft,
  };
}

// All posts, drafts included — static merged with their overrides, plus posts
// created inline — newest first. Callers hide drafts from visitors.
export async function getAllPosts(): Promise<Post[]> {
  const stored = await getStoredPosts();
  const fromStatic = staticPosts
    .filter((post) => !stored[post.id]?.deleted)
    .map((post) => mergePost(post, stored[post.id]));
  const created = Object.entries(stored)
    .filter(
      ([id, entry]) =>
        !entry.deleted && !staticPosts.some((post) => post.id === id),
    )
    .map(([id, entry]) => storedToPost(id, entry));
  return [...fromStatic, ...created].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((post) => post.slug === slug);
}

// Images embedded in posts. The blob store is private, so the browser can't
// load blob URLs directly — images are stored under a timestamped name and
// served through `/api/images/[name]`, which streams them from Blob.
export async function savePostImage(file: File): Promise<string> {
  const name = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
  await put(`${IMAGE_PREFIX}${name}`, file, { access: "private" });
  return `/api/images/${name}`;
}

export const IMAGE_PREFIX = "content/images/";
