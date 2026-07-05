"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  hasContent,
  noteLink,
  resolveLinkMatch,
  IMAGE_LINE,
  INLINE_LINK,
  type EditableNote,
  type Note,
} from "@/lib/notes";
import { IMAGE_URL } from "@/lib/writing";
import { editorButton, editorField } from "@/components/form-classes";
import { RawImage } from "@/components/raw-image";
import { useImageUpload } from "@/components/use-image-upload";
import { updateNote } from "@/app/actions";

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

type MarginContextValue = {
  note: Note;
  setNote: (note: Note) => void;
  canEdit: boolean;
  editingId: string | null;
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
  position: MarginPosition;
  setPosition: (position: MarginPosition) => void;
};

const MarginContext = createContext<MarginContextValue | null>(null);

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
  const openEditor = useCallback((next: EditableNote) => {
    setNote(next);
    setEditingId(next.id);
  }, []);
  const armNote = useCallback((next: EditableNote | null) => {
    armedRef.current = next;
  }, []);
  const armedNote = useCallback(() => armedRef.current, []);
  return (
    <MarginContext.Provider
      value={{
        note,
        setNote,
        canEdit,
        editingId,
        setEditingId,
        openEditor,
        armNote,
        armedNote,
        position,
        setPosition,
      }}
    >
      {children}
    </MarginContext.Provider>
  );
}

export function useMargin(): MarginContextValue {
  const ctx = useContext(MarginContext);
  if (!ctx) throw new Error("useMargin must be used within a MarginProvider");
  return ctx;
}

// Spread the returned handlers onto any hoverable element to push `note` into
// the margin on hover/focus. Behavior is "keep last": we never clear on leave,
// so the panel holds the most recent thing you pointed at. Contentless notes
// never push into the panel — for visitors they're fully inert; for the owner,
// hovering any addressable element arms it for the "m" keybind (which is how
// notes get added to whole elements, e.g. a photo). While the editor is open,
// hover updates are frozen so mousing over other sources on the way to the
// panel can't hijack it.
export function useNote(note: Note) {
  const { setNote, canEdit, editingId, armNote } = useMargin();
  const editable = canEdit && Boolean(note?.id);
  if (!hasContent(note) && !editable) {
    return {};
  }
  const enter = () => {
    if (editable) armNote(note as EditableNote);
    if (editingId === null && hasContent(note)) setNote(note);
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

function NoteEditor({
  note,
  onClose,
}: {
  note: EditableNote;
  onClose: () => void;
}) {
  const { setNote } = useMargin();
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
  const { setPosition } = useMargin();
  useEffect(() => {
    setPosition(position);
    return () => setPosition("corner");
  }, [position, setPosition]);
  return null;
}

// Panel placement per position variant. "content-left" hugs the bottom of the
// content column (13rem rail + 1.5rem gutter), clear of the photo corner.
const positionClass: Record<MarginPosition, string> = {
  corner: "bottom-4 right-4 lg:bottom-6 lg:right-6",
  "content-left": "bottom-4 left-4 lg:bottom-6 lg:left-[14.5rem]",
};

// The panel itself. Desktop-only (hover doesn't exist on touch), pinned on the
// shared frame inset. Fades/rises in once it has a note.
export function Marginalia() {
  const { note, canEdit, editingId, setEditingId, position } = useMargin();

  // Content-less notes only appear while their editor is open (a fresh
  // highlight being written); closing it without content fades the panel out.
  const editing = canEdit && note?.id != null && editingId === note.id;
  const visible = note && (hasContent(note) || editing);

  return (
    <aside
      aria-live="polite"
      aria-label="Detail"
      className={`fixed z-40 hidden max-h-[80vh] w-[19rem] overflow-y-auto transition-opacity duration-200 lg:block ${
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
// text itself is the nearer target.
export function Footnote({
  note,
  children,
}: {
  note: Note;
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
  const className =
    "link-glow underline decoration-dotted underline-offset-4 focus:outline-none";
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
