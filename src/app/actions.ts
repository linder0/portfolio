"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAuthenticated,
} from "@/lib/auth";
import { saveStoredNote } from "@/lib/note-store";
import {
  getAllPosts,
  saveStoredPost,
  type StoredPost,
} from "@/lib/post-store";
import type { StoredNote } from "@/lib/notes";
import { posts as staticPosts } from "@/lib/writing";
import { parentDomain } from "@/lib/domains";
import type { PostDraft } from "@/lib/post-draft";
import { saveStoredPage } from "@/lib/page-store";
import { homeBioBody } from "@/lib/home";

// Every mutating action starts with this gate; a non-null result is the
// error to return as-is.
async function ownerGuard(): Promise<{ error: string } | null> {
  return (await isAuthenticated()) ? null : { error: "Not signed in." };
}

// The session cookie is scoped to the parent domain so one login covers every
// section subdomain (projects., writing., ...). On *.localhost browsers reject
// a shared cookie, so in dev the login is per-subdomain — acceptable locally.
async function setSessionCookie(value: string, maxAge: number): Promise<void> {
  const hostname = ((await headers()).get("host") ?? "").split(":")[0];
  const domain = parentDomain(hostname);
  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    domain: domain === "localhost" ? undefined : (domain ?? undefined),
  });
}

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    // Blunt brute-force damper: make every failed attempt cost a second.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "Wrong password." };
  }

  await setSessionCookie(createSessionToken(), SESSION_MAX_AGE);
  revalidatePath("/", "layout");
  return null;
}

export async function logout(): Promise<void> {
  await setSessionCookie("", 0);
  revalidatePath("/", "layout");
}

// The editor exposes a single content field; title/subtitle/meta only ever
// come from a source's static default note.
export type NoteDraft = {
  body: string;
};

export async function updateNote(
  id: string,
  draft: NoteDraft,
  // For highlight notes: the pinned phrase plus surrounding context, so the
  // note attaches to that one occurrence rather than every repeat of it.
  anchor?: { text: string; prefix?: string; suffix?: string },
): Promise<{ error: string } | { saved: StoredNote }> {
  const denied = await ownerGuard();
  if (denied) return denied;
  if (!id) {
    return { error: "Invalid note." };
  }

  const body = draft.body.trim();

  // Cleared content: remove the override entirely (back to the default; for
  // a highlight this also removes the underline from the page).
  const stored: StoredNote | null = body
    ? anchor
      ? {
          body,
          anchor: anchor.text,
          ...(anchor.prefix && { prefix: anchor.prefix }),
          ...(anchor.suffix && { suffix: anchor.suffix }),
        }
      : { body }
    : null;
  await saveStoredNote(id, stored);
  revalidatePath("/", "layout");
  return { saved: stored ?? {} };
}

/* ---------------------------------------------------------------------------
   Inline page copy — the owner edits a page's body (e.g. the home bio) in
   place. Stored in Blob keyed by page id; the static default is only
   overridden when the copy actually differs, so clearing the editor (or
   saving the default text) reverts to the code-defined copy.
   ------------------------------------------------------------------------- */

const pageDefaults: Record<string, string> = { home: homeBioBody };

export async function updatePage(
  id: string,
  body: string,
): Promise<{ error: string } | { saved: string }> {
  const denied = await ownerGuard();
  if (denied) return denied;
  const base = pageDefaults[id];
  if (base === undefined) {
    return { error: "Unknown page." };
  }
  const clean = body.trim();
  await saveStoredPage(id, clean && clean !== base ? { body: clean } : null);
  revalidatePath("/", "layout");
  return { saved: clean || base };
}

/* ---------------------------------------------------------------------------
   Inline post CRUD — the owner edits a post (title, url, date, tagline,
   thumbnail, body) on its own page. Edits are stored in Blob keyed by post
   id; for a post that exists in `lib/writing`, only the fields that differ
   from the static default are stored (so reverting a field falls back).
   The draft shape (`PostDraft`) lives in `lib/post-draft`.
   ------------------------------------------------------------------------- */

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function updatePost(
  id: string,
  draft: PostDraft,
): Promise<{ error: string } | { saved: PostDraft }> {
  const denied = await ownerGuard();
  if (denied) return denied;

  const clean: PostDraft = {
    slug: draft.slug.trim().toLowerCase(),
    title: draft.title.trim(),
    date: draft.date.trim(),
    tagline: draft.tagline.trim(),
    thumbnail: draft.thumbnail.trim(),
    thumbnailY: Number.isFinite(draft.thumbnailY)
      ? Math.min(100, Math.max(0, Math.round(draft.thumbnailY)))
      : 50,
    body: draft.body.trim(),
    draft: draft.draft,
  };

  if (!clean.title) return { error: "Title is required." };
  if (!SLUG_RE.test(clean.slug)) {
    return { error: "URL can only use lowercase letters, numbers, hyphens." };
  }
  if (!DATE_RE.test(clean.date)) return { error: "Date must be YYYY-MM-DD." };

  const all = await getAllPosts();
  if (!all.some((post) => post.id === id)) {
    return { error: "Unknown post." };
  }
  if (all.some((post) => post.id !== id && post.slug === clean.slug)) {
    return { error: `The URL /${clean.slug} is already taken.` };
  }

  const base = staticPosts.find((post) => post.id === id);
  if (base) {
    // Store only what differs from the static default.
    const stored: StoredPost = {};
    if (clean.slug !== base.slug) stored.slug = clean.slug;
    if (clean.title !== base.title) stored.title = clean.title;
    if (clean.date !== base.date) stored.date = clean.date;
    if (clean.tagline !== base.tagline) stored.tagline = clean.tagline;
    if (clean.thumbnail !== (base.thumbnail ?? "")) {
      stored.thumbnail = clean.thumbnail;
    }
    if (clean.thumbnailY !== (base.thumbnailY ?? 50)) {
      stored.thumbnailY = clean.thumbnailY;
    }
    if (clean.body !== base.body) stored.body = clean.body;
    if (clean.draft !== (base.draft ?? false)) stored.draft = clean.draft;
    await saveStoredPost(id, Object.keys(stored).length ? stored : null);
  } else {
    await saveStoredPost(id, clean);
  }

  revalidatePath("/", "layout");
  return { saved: clean };
}

// A new post starts as a blank stored entry — a draft, so it stays private
// until the owner publishes it; the id doubles as the initial URL until the
// owner renames it.
export async function createPost(): Promise<
  { error: string } | { slug: string }
> {
  const denied = await ownerGuard();
  if (denied) return denied;
  const id = `post-${Date.now().toString(36)}`;
  await saveStoredPost(id, {
    slug: id,
    title: "Untitled",
    date: new Date().toISOString().slice(0, 10),
    tagline: "",
    body: "",
    draft: true,
  });
  revalidatePath("/", "layout");
  return { slug: id };
}

export async function deletePost(
  id: string,
): Promise<{ error: string } | { deleted: true }> {
  const denied = await ownerGuard();
  if (denied) return denied;
  const isStatic = staticPosts.some((post) => post.id === id);
  // A static post can't be removed from the code here — mark it deleted so
  // it stays hidden; a created post is simply dropped from the store.
  await saveStoredPost(id, isStatic ? { deleted: true } : null);
  revalidatePath("/", "layout");
  return { deleted: true };
}

