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
import { getStoredComments, saveStoredComment } from "@/lib/comment-store";
import {
  COMMENT_ANCHOR_MAX,
  COMMENT_BODY_MAX,
  COMMENT_NAME_MAX,
  type StoredComment,
} from "@/lib/comments";
import {
  getAllPosts,
  saveStoredPost,
  type StoredPost,
} from "@/lib/post-store";
import {
  getAllProjects,
  saveStoredProject,
  type StoredProject,
} from "@/lib/project-store";
import { projects as staticProjects } from "@/lib/projects";
import type { StoredNote } from "@/lib/notes";
import { posts as staticPosts } from "@/lib/writing";
import { parentDomain } from "@/lib/domains";
import type { PostDraft } from "@/lib/post-draft";
import type { ProjectDraft } from "@/lib/project-draft";
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

/* ---------------------------------------------------------------------------
   Inline project edits — the owner edits a project (title, url, year,
   tagline, thumbnail, description, body) on its own page. Edits are stored
   in Redis keyed by the static slug; only fields that differ from the
   code default are stored (so reverting a field falls back).
   ------------------------------------------------------------------------- */

const YEAR_RE = /^\d{4}$/;

export async function updateProject(
  id: string,
  draft: ProjectDraft,
): Promise<{ error: string } | { saved: ProjectDraft }> {
  const denied = await ownerGuard();
  if (denied) return denied;

  const clean: ProjectDraft = {
    slug: draft.slug.trim().toLowerCase(),
    title: draft.title.trim(),
    year: draft.year.trim(),
    tagline: draft.tagline.trim(),
    thumbnail: draft.thumbnail.trim(),
    description: draft.description.trim(),
    body: draft.body.trim(),
    mediaGap:
      typeof draft.mediaGap === "number" && Number.isFinite(draft.mediaGap)
        ? Math.max(0, Math.round(draft.mediaGap))
        : undefined,
    draft: draft.draft,
  };

  if (!clean.title) return { error: "Title is required." };
  if (!SLUG_RE.test(clean.slug)) {
    return { error: "URL can only use lowercase letters, numbers, hyphens." };
  }
  if (!YEAR_RE.test(clean.year)) return { error: "Year must be YYYY." };

  const base = staticProjects.find((project) => project.slug === id);
  if (!base) return { error: "Unknown project." };

  const all = await getAllProjects();
  if (all.some((project) => projectIdOf(project) !== id && project.slug === clean.slug)) {
    return { error: `The URL /${clean.slug} is already taken.` };
  }

  const stored: StoredProject = {};
  if (clean.slug !== base.slug) stored.slug = clean.slug;
  if (clean.title !== base.title) stored.title = clean.title;
  if (clean.year !== base.year) stored.year = clean.year;
  if (clean.tagline !== base.tagline) stored.tagline = clean.tagline;
  if (clean.thumbnail !== (base.thumbnail ?? "")) {
    stored.thumbnail = clean.thumbnail;
  }
  if (clean.description !== base.description) stored.description = clean.description;
  if (clean.body !== (base.body ?? "")) stored.body = clean.body;
  if (clean.mediaGap !== undefined && clean.mediaGap !== base.mediaGap) {
    stored.mediaGap = clean.mediaGap;
  }
  if (clean.draft !== (base.draft ?? false)) stored.draft = clean.draft;
  await saveStoredProject(id, Object.keys(stored).length ? stored : null);

  revalidatePath("/", "layout");
  return { saved: clean };
}

function projectIdOf(project: { id?: string; slug: string }): string {
  return project.id ?? project.slug;
}

/* ---------------------------------------------------------------------------
   Visitor comments — the one PUBLIC mutation on the site: anyone can pin a
   comment to selected post text with just a name (see `lib/comments`).
   Spam dampers, not walls: a honeypot field bots tend to fill, a per-IP
   throttle (in-memory — best-effort across serverless instances), and a
   global cap so the Blob document can't grow without bound. The owner
   moderates by deleting from the margin panel.
   ------------------------------------------------------------------------- */

const COMMENT_WINDOW_MS = 60_000;
const COMMENTS_PER_WINDOW = 5;
const COMMENTS_CAP = 2000;
const recentCommentTimes = new Map<string, number[]>();

function commentThrottled(ip: string): boolean {
  const now = Date.now();
  // Sweep IPs whose window has fully elapsed first, so the map is bounded by
  // the number of IPs active within the window rather than growing forever.
  for (const [key, stamps] of recentCommentTimes) {
    const live = stamps.filter((t) => now - t < COMMENT_WINDOW_MS);
    if (live.length) recentCommentTimes.set(key, live);
    else recentCommentTimes.delete(key);
  }
  const times = recentCommentTimes.get(ip) ?? [];
  if (times.length >= COMMENTS_PER_WINDOW) return true;
  times.push(now);
  recentCommentTimes.set(ip, times);
  return false;
}

export type CommentDraft = {
  postId: string;
  anchor: string;
  prefix?: string;
  suffix?: string;
  name: string;
  body: string;
  // Honeypot — a visually hidden field humans never fill.
  website?: string;
};

export async function addComment(
  draft: CommentDraft,
): Promise<{ error: string } | { saved: true }> {
  // A filled honeypot gets a quiet "success" so bots don't adapt.
  if (draft.website) return { saved: true };

  const name = draft.name.trim();
  const body = draft.body.trim();
  const anchor = draft.anchor.trim();
  if (!name) return { error: "A name is required." };
  if (name.length > COMMENT_NAME_MAX) {
    return { error: `Names cap at ${COMMENT_NAME_MAX} characters.` };
  }
  if (!body) return { error: "A comment is required." };
  if (body.length > COMMENT_BODY_MAX) {
    return { error: `Comments cap at ${COMMENT_BODY_MAX} characters.` };
  }
  if (!anchor || anchor.length > COMMENT_ANCHOR_MAX) {
    return { error: "Select a shorter passage to comment on." };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  if (commentThrottled(ip)) {
    return { error: "Too many comments at once — try again in a minute." };
  }

  const all = await getAllPosts();
  if (!all.some((post) => post.id === draft.postId)) {
    return { error: "Unknown post." };
  }
  if (Object.keys(await getStoredComments()).length >= COMMENTS_CAP) {
    return { error: "The comment box is full." };
  }

  const id = `comment:${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const stored: StoredComment = {
    postId: draft.postId,
    anchor,
    ...(draft.prefix && { prefix: draft.prefix }),
    ...(draft.suffix && { suffix: draft.suffix }),
    name,
    body,
    createdAt: new Date().toISOString(),
  };
  await saveStoredComment(id, stored);
  revalidatePath("/", "layout");
  return { saved: true };
}

export async function deleteComment(
  id: string,
): Promise<{ error: string } | { deleted: true }> {
  const denied = await ownerGuard();
  if (denied) return denied;
  await saveStoredComment(id, null);
  revalidatePath("/", "layout");
  return { deleted: true };
}

