import type { Project, ProjectLink } from "@/lib/projects";
import { IMAGE_URL, postExcerpt, type Post } from "@/lib/writing";
import type { CommentDisplay } from "@/lib/comments";

/* ---------------------------------------------------------------------------
   Note — a normalized, source-agnostic descriptor of what the marginalia panel
   shows. Not a domain model: any source (a project row, an outbound link, an
   inline footnote, a bio paragraph) maps itself into this shape. Types +
   builders live here in `lib` so the dependency flows lib → components.
   ------------------------------------------------------------------------- */

export type NoteMeta = { label: string; value: string };

export type Note = {
  // Stable identity for owner-editable notes (e.g. "project:hangful").
  // Notes without an id aren't editable.
  id?: string;
  // For highlight annotations: the exact page text this note is pinned to,
  // plus the (normalized) text immediately around the selection so the note
  // pins to that one occurrence rather than every repeat of the same phrase.
  anchor?: string;
  prefix?: string;
  suffix?: string;
  title?: string;
  subtitle?: string;
  meta?: NoteMeta[];
  body?: string;
  // Visitor comments pinned to this anchor (see `lib/comments`). A comment
  // note has no editable fields of its own — the thread is the content.
  comments?: CommentDisplay[];
} | null;

// A note that is guaranteed addressable (and therefore owner-editable).
export type EditableNote = NonNullable<Note> & { id: string };

// An owner-edited note, stored in Blob keyed by note id. Fields are merged
// over a source's default note; a missing/empty field falls back to the
// default (so clearing a field in the editor reverts it). Highlight
// annotations additionally carry the `anchor` text they're pinned to.
export type StoredNote = {
  anchor?: string;
  prefix?: string;
  suffix?: string;
  title?: string;
  subtitle?: string;
  meta?: NoteMeta[];
  body?: string;
};

export function mergeNote<T extends NonNullable<Note>>(
  base: T,
  stored?: StoredNote,
): T {
  if (!stored) return base;
  return {
    ...base,
    title: stored.title ?? base.title,
    subtitle: stored.subtitle ?? base.subtitle,
    meta: stored.meta ?? base.meta,
    body: stored.body ?? base.body,
  };
}

// Whether a note has anything a visitor should see. Empty shells (an id
// waiting for the owner to add content) stay invisible to the public.
export function hasContent(note: Note): boolean {
  if (!note) return false;
  return Boolean(
    note.title ||
      note.subtitle ||
      note.body ||
      note.meta?.length ||
      note.comments?.length,
  );
}

/* ---------------------------------------------------------------------------
   Links inside note bodies. Bodies are plain text where a pasted URL becomes
   a link and [text](url) is accepted when a link needs a label; a line that
   is just an image URL renders as the photo. These regexes are shared with
   the marginalia panel renderer so both agree on what counts as a link.
   ------------------------------------------------------------------------- */

// A labeled [text](url) link, or a bare URL.
export const INLINE_LINK = /\[([^\]]+)\]\((\S+?)\)|https?:\/\/[^\s]+/g;
// Punctuation that's likely sentence-ending rather than part of a bare URL.
export const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;
// Legacy explicit form, still accepted: a line that is just ![alt](url).
export const IMAGE_LINE = /^!\[([^\]]*)\]\((\S+)\)$/;

// Resolve an INLINE_LINK match: the destination, the author-given label (null
// for a bare URL), and how many characters of the source text the link
// consumed (a bare URL gives its trailing sentence punctuation back).
export function resolveLinkMatch(match: RegExpMatchArray): {
  href: string;
  label: string | null;
  length: number;
} {
  if (match[1]) {
    return { href: match[2], label: match[1], length: match[0].length };
  }
  const href = match[0].replace(TRAILING_PUNCTUATION, "");
  return { href, label: null, length: href.length };
}

// The first link a note's body contains, if any — the destination a hover
// source navigates to when clicked. Image lines don't count (they render as
// photos, not links), and neither do image URLs.
export function noteLink(note: Note): string | null {
  if (!note?.body) return null;
  for (const line of note.body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || IMAGE_LINE.test(trimmed) || IMAGE_URL.test(trimmed)) {
      continue;
    }
    for (const match of trimmed.matchAll(INLINE_LINK)) {
      const { href } = resolveLinkMatch(match);
      if (!IMAGE_URL.test(href)) return href;
    }
  }
  return null;
}

// A project's note for the row hover on the projects index: just the
// description — the row itself already shows title/tagline/year, so the
// margin only adds the commentary.
export function projectToNote(project: Project): EditableNote {
  return {
    id: `project:${project.slug}`,
    body: project.description,
  };
}

// A post's note for the row hover on the writing index: just the excerpt —
// like projects, the row already shows title/tagline/date/thumbnail, so the
// margin only adds a taste of the body.
export function postToNote(post: Post): EditableNote {
  return {
    id: `post:${post.slug}`,
    body: postExcerpt(post.body),
  };
}

// The subscribe button on the writing index.
export function newsletterNote(): EditableNote {
  return {
    id: "newsletter",
    body: "you'll get emails when I write new things :D",
  };
}

// An outbound project link (buttons on a project detail page). The margin
// shows only where it goes — the destination URL, rendered as a link by the
// panel — nothing else.
export function projectLinkToNote(link: ProjectLink): EditableNote {
  return {
    id: `link:${link.url}`,
    body: link.url,
  };
}

// An empty, addressable note for elements that have no default marginalia —
// the owner can fill it in from the panel; visitors see nothing until then.
export function emptyNote(id: string): EditableNote {
  return { id };
}

/* ---------------------------------------------------------------------------
   Highlight annotations — notes pinned to a phrase of page text. The id is
   derived from the anchor text itself so the client (which creates a highlight
   from a selection) and the server (which renders stored highlights) agree
   without coordination.
   ------------------------------------------------------------------------- */

// Collapse whitespace so a selection matches the source string even when the
// DOM introduced line breaks.
export function normalizeAnchor(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Like normalizeAnchor, but keeps edge whitespace (context runs right up to
// the anchor, so a trailing/leading space is significant).
export function normalizeContext(text: string): string {
  return text.replace(/\s+/g, " ");
}

// djb2 — tiny, stable, good enough to key a handful of personal annotations.
// Context participates so the same word highlighted in two places gets two
// distinct notes.
export function highlightId(anchor: string, prefix = "", suffix = ""): string {
  const key = `${prefix}\u241f${anchor}\u241f${suffix}`;
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) >>> 0;
  }
  return `hl:${hash.toString(36)}`;
}

// The occurrence of a pinned anchor inside `text` whose surroundings match
// the stored prefix/suffix (-1 if none). The captured context can extend
// past the source string (the DOM block may hold more text, e.g. a row's
// title before its tagline), so at the string's edges it's enough for the
// stored context to *contain* what's actually there. Shared with visitor
// comments (`lib/comments`), which pin to text the same way.
export function anchorIndex(
  text: string,
  note: { anchor?: string; prefix?: string; suffix?: string },
): number {
  const anchor = note.anchor!;
  const prefix = note.prefix ?? "";
  const suffix = note.suffix ?? "";
  let i = text.indexOf(anchor);
  if (!prefix && !suffix) return i; // legacy highlight: first occurrence

  while (i !== -1) {
    const end = i + anchor.length;
    const before = text.slice(Math.max(0, i - prefix.length), i);
    const after = text.slice(end, end + suffix.length);
    const prefixOk =
      before.length === prefix.length
        ? before === prefix
        : prefix.endsWith(before); // anchor sits near the string's start
    const suffixOk =
      after.length === suffix.length
        ? after === suffix
        : suffix.startsWith(after); // anchor sits near the string's end
    if (prefixOk && suffixOk) return i;
    i = text.indexOf(anchor, i + 1);
  }
  return -1;
}

// The stored highlights that anchor somewhere inside `text`, in order of
// appearance, non-overlapping (first match wins).
export function highlightsIn(
  text: string,
  stored: Record<string, StoredNote>,
): { id: string; anchor: string; note: EditableNote; index: number }[] {
  const found = Object.entries(stored)
    .filter(([id, note]) => id.startsWith("hl:") && note.anchor)
    .map(([id, note]) => ({
      id,
      anchor: note.anchor!,
      note: { id, ...note } as EditableNote,
      index: anchorIndex(text, note),
    }))
    .filter((h) => h.index !== -1)
    .sort((a, b) => a.index - b.index);

  const result: typeof found = [];
  let cursor = 0;
  for (const h of found) {
    if (h.index >= cursor) {
      result.push(h);
      cursor = h.index + h.anchor.length;
    }
  }
  return result;
}
