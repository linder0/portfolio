"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  hasContent,
  noteLink,
  resolveLinkMatch,
  IMAGE_LINE,
  INLINE_LINK,
  type EditableNote,
  type Note,
} from "@/lib/notes";
import { formatCommentDate, type CommentDisplay } from "@/lib/comments";
import { IMAGE_URL } from "@/lib/writing";
import { editorButton, editorField } from "@/components/form-classes";
import { RawImage } from "@/components/raw-image";
import { useImageUpload } from "@/components/use-image-upload";
import { deleteComment, updateNote } from "@/app/actions";

/* ---------------------------------------------------------------------------
   Marginalia — the fixed rectangle in the lower-right that shows supplementary
   detail. Borrowed from print: a "margin" holds sidenotes and footnotes beside
   the main column. Many sources (project rows, links, inline footnotes) push a
   `Note` (see `lib/notes`) into the one shared margin.

   When the owner is signed in (`canEdit`), a note with an id can be rewritten
   in place; new notes are created deliberately with the "m" keybind — select
   text to pin a highlight note, or hover an addressable element (photo, bio
   paragraph) with nothing selected to write that element's note. Saves
   persist via the `updateNote` server action.
   ------------------------------------------------------------------------- */

// Where the fixed panel sits. "corner" is the default lower-right; pages can
// claim another spot when that corner is occupied (the home page's photo).
type MarginPosition = "corner" | "content-left";

// The margin is split into two contexts on purpose. `note`/`editingId`/
// `position` change on every hover and editor toggle, but the actions never
// change as you move the pointer. Keeping them apart means the many hover
// sources — every index row, footnote, and note-host — subscribe only to the
// actions and don't re-render on each hover; only the panel itself
// (`Marginalia`) reads the changing state.
type MarginState = {
  note: Note;
  editingId: string | null;
  position: MarginPosition;
};

type MarginActions = {
  canEdit: boolean;
  // Show a note in the panel, unless an editor is open (hover updates are
  // frozen while editing so mousing toward the panel can't hijack it). The
  // freeze is checked against a ref so this stays referentially stable.
  showNote: (note: Note) => void;
  // Set the panel note directly, bypassing the editing freeze (the editor
  // uses this to reflect a just-saved note).
  setNote: (note: Note) => void;
  setEditingId: (id: string | null) => void;
  // Push a note into the margin and open its editor (used by the highlight
  // keybind, which creates notes that no element hosts yet).
  openEditor: (note: EditableNote) => void;
  // Owner-only "point at it" tracking: while the pointer is over an
  // addressable element (a bio paragraph, the photo, ...), its note is armed
  // so pressing "m" with no text selected opens that note's editor. Held in
  // a ref — arming shouldn't re-render anything.
  armNote: (note: EditableNote | null) => void;
  armedNote: () => EditableNote | null;
  setPosition: (position: MarginPosition) => void;
};

const MarginStateContext = createContext<MarginState | null>(null);
const MarginActionsContext = createContext<MarginActions | null>(null);

export function MarginProvider({
  canEdit = false,
  children,
}: {
  canEdit?: boolean;
  children: ReactNode;
}) {
  const [note, setNote] = useState<Note>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [position, setPosition] = useState<MarginPosition>("corner");
  const armedRef = useRef<EditableNote | null>(null);

  // `showNote` must stay referentially stable (hover sources depend on it not
  // changing), yet needs the current editing state to know whether to freeze.
  // Mirror `editingId` into a ref — updated in an effect, read only inside the
  // hover handler — so the check works without rebuilding the action.
  const editingIdRef = useRef<string | null>(null);
  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  const showNote = useCallback((next: Note) => {
    if (editingIdRef.current === null) setNote(next);
  }, []);
  const openEditor = useCallback((next: EditableNote) => {
    setNote(next);
    setEditingId(next.id);
  }, []);
  const armNote = useCallback((next: EditableNote | null) => {
    armedRef.current = next;
  }, []);
  const armedNote = useCallback(() => armedRef.current, []);

  // The provider lives in the root layout, so its state survives client-side
  // navigation. Without a reset, an editor left open on one page would freeze
  // hover updates on the next and a stale note would linger. Clearing the note
  // and editor is React's "adjust state while rendering" pattern (lands before
  // paint, no extra commit); the armed ref is cleared in an effect since refs
  // can't be touched during render.
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setNote(null);
    setEditingId(null);
  }
  useEffect(() => {
    armedRef.current = null;
  }, [pathname]);

  const actions = useMemo<MarginActions>(
    () => ({
      canEdit,
      showNote,
      setNote,
      setEditingId,
      openEditor,
      armNote,
      armedNote,
      setPosition,
    }),
    [canEdit, showNote, setEditingId, openEditor, armNote, armedNote],
  );
  const state = useMemo<MarginState>(
    () => ({ note, editingId, position }),
    [note, editingId, position],
  );

  return (
    <MarginActionsContext.Provider value={actions}>
      <MarginStateContext.Provider value={state}>
        {children}
      </MarginStateContext.Provider>
    </MarginActionsContext.Provider>
  );
}

export function useMarginActions(): MarginActions {
  const ctx = useContext(MarginActionsContext);
  if (!ctx) {
    throw new Error("useMarginActions must be used within a MarginProvider");
  }
  return ctx;
}

function useMarginState(): MarginState {
  const ctx = useContext(MarginStateContext);
  if (!ctx) {
    throw new Error("useMarginState must be used within a MarginProvider");
  }
  return ctx;
}

// `canEdit` is the one field non-margin components need (edit affordances,
// keybinds); it lives on the always-stable actions context.
export function useCanEdit(): boolean {
  return useMarginActions().canEdit;
}

// Spread the returned handlers onto any hoverable element to push `note` into
// the margin on hover/focus. Behavior is "keep last": we never clear on leave,
// so the panel holds the most recent thing you pointed at (until you leave the
// page). Contentless notes never push into the panel — for visitors they're
// fully inert; for the owner, hovering any addressable element arms it for the
// "m" keybind (which is how notes get added to whole elements, e.g. a photo).
// While the editor is open, hover updates are frozen (see `showNote`) so
// mousing over other sources on the way to the panel can't hijack it. Reads
// only the stable actions context, so hovering never re-renders the source.
export function useNote(note: Note) {
  const { showNote, canEdit, armNote } = useMarginActions();
  const editable = canEdit && Boolean(note?.id);
  if (!hasContent(note) && !editable) {
    return {};
  }
  const enter = () => {
    if (editable) armNote(note as EditableNote);
    if (hasContent(note)) showNote(note);
  };
  const leave = () => {
    if (editable) armNote(null);
  };
  return {
    onPointerEnter: enter,
    onFocus: enter,
    onPointerLeave: leave,
    onBlur: leave,
  };
}

/* ---------------------------------------------------------------------------
   Note bodies are plain text with URLs handled automatically: a pasted URL
   becomes a link, a line that is just an image URL becomes the photo itself
   (this is what "add photo" inserts). [text](url) is optionally supported for
   when a link needs a label. Nothing else — no headings, bold, etc. The
   link/image regexes live in `lib/notes` (shared with `noteLink`, which lets
   hover sources navigate to their note's link on click).
   ------------------------------------------------------------------------- */

function NoteLinkText({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // The panel is pointer-events-none for visitors so it never blocks the
      // page under it; links opt back in so they stay clickable.
      className="link-glow pointer-events-auto underline decoration-dotted underline-offset-4"
    >
      {label}
    </a>
  );
}

function InlineText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_LINK)) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const { href, label, length } = resolveLinkMatch(match);
    nodes.push(
      <NoteLinkText
        key={match.index}
        href={href}
        // A bare URL displays without the protocol noise or a dangling slash.
        label={
          label ?? href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
        }
      />,
    );
    cursor = match.index + length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function NoteBody({ body }: { body: string }) {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <>
      {lines.map((line, i) => {
        const image = line.match(IMAGE_LINE);
        const src = image ? image[2] : IMAGE_URL.test(line) ? line : null;
        if (src) {
          return (
            <RawImage
              key={i}
              src={src}
              alt={image?.[1] ?? ""}
              className="block h-auto max-w-full"
            />
          );
        }
        return (
          <p key={i}>
            <InlineText text={line} />
          </p>
        );
      })}
    </>
  );
}

// A visitor comment thread pinned to one phrase (fed into the margin by a
// comment-variant Footnote). Bodies render as plain text on purpose — no
// links or images from strangers. The signed-in owner moderates with a
// delete per comment; the panel note is patched locally so the thread
// updates before the refreshed page re-renders.
function CommentThread({ comments }: { comments: CommentDisplay[] }) {
  const { canEdit, setNote } = useMarginActions();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteComment(id);
      if ("deleted" in result) {
        const left = comments.filter((comment) => comment.id !== id);
        setNote(left.length ? { comments: left } : null);
        router.refresh();
      }
    });
  };

  return (
    <>
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-1">
          <p className="opacity-60">
            {comment.name} · {formatCommentDate(comment.createdAt)}
          </p>
          <p className="whitespace-pre-wrap">{comment.body}</p>
          {canEdit && (
            <button
              type="button"
              onClick={() => remove(comment.id)}
              disabled={pending}
              className={editorButton}
            >
              delete
            </button>
          )}
        </div>
      ))}
    </>
  );
}

function NoteEditor({
  note,
  onClose,
}: {
  note: EditableNote;
  onClose: () => void;
}) {
  const { setNote } = useMarginActions();
  const router = useRouter();
  const [body, setBody] = useState(note.body ?? "");
  const [pending, startTransition] = useTransition();
  const { uploading, upload } = useImageUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = pending || uploading;

  const save = () => {
    startTransition(async () => {
      const result = await updateNote(
        note.id,
        { body },
        note.anchor
          ? { text: note.anchor, prefix: note.prefix, suffix: note.suffix }
          : undefined,
      );
      if ("saved" in result) {
        // Show the saved note immediately; cleared content means "revert to
        // default", which the next server render supplies on re-hover.
        setNote({ id: note.id, ...result.saved });
        onClose();
        // Re-render the post body so a newly pinned highlight's phrase picks
        // up its underline (and a cleared one drops it) without a manual
        // reload — the same refresh the post and comment editors do.
        router.refresh();
      }
    });
  };

  // Upload the picked photo and append its URL on its own line (which renders
  // as the photo); it's saved with the rest of the note on "save".
  const addPhoto = async (file: File) => {
    const url = await upload(file);
    if (url) setBody((prev) => `${prev.trimEnd()}\n${url}`.trim());
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {note.anchor && (
        <p className="copy-14 opacity-60">pinned to “{note.anchor}”</p>
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        autoFocus
        disabled={busy}
        className={`${editorField} resize-y`}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void addPhoto(file);
        }}
      />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className={editorButton}
        >
          {pending ? "saving…" : "save"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={editorButton}
        >
          {uploading ? "uploading…" : "add photo"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className={editorButton}
        >
          cancel
        </button>
      </div>
    </div>
  );
}

// Rendered by a page to claim a non-default spot for the margin panel while
// that page is mounted (e.g. the home page, whose lower-right corner holds
// the photo). Resets to the corner on unmount.
export function MarginaliaAnchor({
  position,
}: {
  position: MarginPosition;
}) {
  const { setPosition } = useMarginActions();
  useEffect(() => {
    setPosition(position);
    return () => setPosition("corner");
  }, [position, setPosition]);
  return null;
}

// Panel placement per position variant. "content-left" hugs the bottom of the
// content column (rail + gutter = grid column 3), clear of the photo corner.
const positionClass: Record<MarginPosition, string> = {
  corner: "bottom-4 right-4 lg:bottom-6 lg:right-6",
  "content-left":
    "bottom-4 left-4 lg:bottom-6 lg:left-[calc(var(--spacing-rail)+var(--spacing-gutter))]",
};

// The panel itself. Desktop-only (hover doesn't exist on touch), pinned on the
// shared frame inset. Fades/rises in once it has a note.
export function Marginalia() {
  const { note, editingId, position } = useMarginState();
  const { canEdit, setEditingId } = useMarginActions();
  const asideRef = useRef<HTMLElement>(null);

  // Content-less notes only appear while their editor is open (a fresh
  // highlight being written); closing it without content fades the panel out.
  const editing = canEdit && note?.id != null && editingId === note.id;
  const visible = note && (hasContent(note) || editing);

  // While an editor is open it freezes all hover updates, so it must be easy
  // to dismiss. Escape and a click anywhere outside the panel close it — the
  // editor otherwise persists (its state lives in the root layout) and would
  // silently stop the margin from responding to hover.
  useEffect(() => {
    if (!editing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditingId(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!asideRef.current?.contains(event.target as Node)) {
        setEditingId(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    // Capture phase so we see the click even if something stops propagation.
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [editing, setEditingId]);

  return (
    <aside
      ref={asideRef}
      aria-live="polite"
      aria-label="Detail"
      className={`fixed z-40 hidden max-h-[80vh] w-panel overflow-y-auto transition-opacity duration-200 lg:block ${
        positionClass[position]
      } ${visible ? "opacity-100" : "opacity-0"} ${
        canEdit ? "" : "pointer-events-none"
      }`}
    >
      {visible && (
        <div className="copy-14 space-y-3">
          {editing ? (
            <NoteEditor
              key={note.id}
              note={note as EditableNote}
              onClose={() => setEditingId(null)}
            />
          ) : (
            <>
              {note.title && <p>{note.title}</p>}
              {note.subtitle && <p>{note.subtitle}</p>}

              {note.meta?.length ? (
                <div>
                  {note.meta.map((row) => (
                    <p key={`${row.label}:${row.value}`}>
                      {row.label ? `${row.label}: ${row.value}` : row.value}
                    </p>
                  ))}
                </div>
              ) : null}

              {note.body && <NoteBody body={note.body} />}

              {note.comments?.length ? (
                <CommentThread comments={note.comments} />
              ) : null}

              {canEdit && note.id && (
                <button
                  type="button"
                  onClick={() => setEditingId(note.id!)}
                  className={editorButton}
                >
                  edit
                </button>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}

// Inline footnote marker. Wrap inline text; on hover/focus it feeds its own
// note into the same margin. When the note contains a link, the marker is a
// real anchor to it — the panel's links are also clickable, but the hovered
// text itself is the nearer target. Visitor comment anchors use the
// "comment" variant: a solid underline, distinct from the owner's dotted
// marginalia.
export function Footnote({
  note,
  variant = "note",
  children,
}: {
  note: Note;
  variant?: "note" | "comment";
  children: ReactNode;
}) {
  const handlers = useNote(note);
  // Contentless highlights (owner shells) stay visually plain — the "?"
  // cursor and underline only make sense when there's marginalia to show.
  if (!hasContent(note)) {
    return (
      <span {...handlers}>{children}</span>
    );
  }
  const href = noteLink(note);
  const className = `link-glow underline underline-offset-4 focus:outline-none ${
    variant === "comment" ? "decoration-solid" : "decoration-dotted"
  }`;
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...handlers}
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <span {...handlers} tabIndex={0} className={`${className} cursor-help`}>
      {children}
    </span>
  );
}
