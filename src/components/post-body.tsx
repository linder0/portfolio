"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCanEdit } from "@/components/marginalia";
import { splitChunks, type Post } from "@/lib/writing";
import { draftFrom, type PostDraft } from "@/lib/post-draft";
import {
  editorButton,
  editorField,
  editorTextarea,
} from "@/components/form-classes";
import { RawImage } from "@/components/raw-image";
import { useImageUpload } from "@/components/use-image-upload";
import { IMAGE_MOVE_TYPE } from "@/components/post-image";
import { deletePost, updatePost } from "@/app/actions";

/* ---------------------------------------------------------------------------
   PostBody — wraps a post's server-rendered body (`children`) with the
   owner's inline editing tools. Visitors just see the children. When signed
   in:

   - "edit post" swaps the body for a form over every field: title, url
     (slug), date, tagline, thumbnail, and the body as one text box (blank
     lines split paragraphs; a line that is just an image URL renders as the
     image — resize it on the rendered post after saving — and lines right
     under the URL are the image's caption; "# "/"## " start headings, "- "
     and "1. " lines are lists, "> " quotes, ``` fences code, "---" rules;
     ⌘B and ⌘I wrap the selection in asterisk markers for inline bold and
     italic, ⌘K wraps it as a [text](url) link).
   - Images can be dragged onto the *rendered* body — a hairline shows where
     they'll land between paragraphs — or dropped/pasted into the textarea.
   - A status field switches the post between published and draft (drafts are
     owner-only); a draft also gets a one-click "publish" button.
   - "delete post" (with a confirm step) removes the post.

   Saves go through the `updatePost` server action (stored in Blob keyed by
   the post's stable id) and re-render via router.refresh(). Renaming the url
   navigates to the new address; deleting returns to the index.
   ------------------------------------------------------------------------- */

function imageFile(dt: DataTransfer): File | null {
  const file = Array.from(dt.files).find((f) => f.type.startsWith("image/"));
  return file ?? null;
}

// The edit-mode banner preview: the thumbnail in the post page's 3:1 crop.
// When the image is taller than the crop, dragging it vertically moves the
// focal point (draft.thumbnailY, 0–100); the value saves with the form.
function ThumbnailBanner({
  src,
  y,
  onChange,
  disabled,
}: {
  src: string;
  y: number;
  onChange: (y: number) => void;
  disabled: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);

  const startDrag = (e: React.PointerEvent) => {
    const img = imgRef.current;
    if (disabled || !img?.naturalWidth) return;
    e.preventDefault();
    const box = img.getBoundingClientRect();
    // The image pixels hidden by the crop — the drag's full travel. One
    // object-position percent shifts the image by overflow/100 pixels.
    const overflow =
      (img.naturalHeight / img.naturalWidth) * box.width - box.height;
    if (overflow <= 0) return;
    const startY = e.clientY;
    const from = y;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientY - startY;
      onChange(Math.min(100, Math.max(0, from - (delta / overflow) * 100)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <RawImage
      ref={imgRef}
      src={src}
      draggable={false}
      onPointerDown={startDrag}
      className={`mt-3 aspect-[3/1] w-full touch-none select-none border border-border object-cover ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ objectPosition: `50% ${y}%` }}
    />
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ? `block ${className}` : "block"}>
      <span className="mono-13 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function PostBody({
  post,
  children,
}: {
  post: Post;
  children: React.ReactNode;
}) {
  const canEdit = useCanEdit();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PostDraft>(() => draftFrom(post));
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const { uploading, upload } = useImageUpload();
  // While dragging an image over the rendered body: the chunk index the drop
  // would insert before (chunks.length = append), and the indicator's y.
  const [drop, setDrop] = useState<{ index: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const bodyFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);
  const busy = pending || uploading;

  if (!canEdit) return <>{children}</>;

  const set = (patch: Partial<PostDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const openEditor = () => {
    setDraft(draftFrom(post));
    setError(null);
    setConfirmingDelete(false);
    setEditing(true);
  };

  const save = (next: PostDraft) => {
    setError(null);
    startTransition(async () => {
      const result = await updatePost(post.id, next);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setEditing(false);
      if (result.saved.slug !== post.slug) {
        // The last path segment is the slug on both /writing/<slug> and the
        // writing subdomain's /<slug>.
        router.push(
          window.location.pathname.replace(/[^/]+\/?$/, result.saved.slug),
        );
      }
      router.refresh();
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const result = await deletePost(post.id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(window.location.pathname.replace(/\/[^/]+\/?$/, "") || "/");
      router.refresh();
    });
  };

  /* ------------------------- display-mode drag/drop ---------------------- */

  // Where between the rendered blocks a drop at clientY would insert.
  const dropTarget = (clientY: number): { index: number; y: number } => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return { index: 0, y: 0 };
    const blocks = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-post-block]"),
    );
    const wrapperTop = wrapper.getBoundingClientRect().top;
    for (let i = 0; i < blocks.length; i++) {
      const rect = blocks[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        return { index: i, y: rect.top - wrapperTop - 12 };
      }
    }
    const last = blocks[blocks.length - 1];
    const bottom = last
      ? last.getBoundingClientRect().bottom - wrapperTop + 12
      : 0;
    return { index: blocks.length, y: bottom };
  };

  const onDragOver = (e: React.DragEvent) => {
    const isFile = e.dataTransfer.types.includes("Files");
    const isMove = e.dataTransfer.types.includes(IMAGE_MOVE_TYPE);
    if (!isFile && !isMove) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = isMove ? "move" : "copy";
    setDrop(dropTarget(e.clientY));
  };

  const onDrop = (e: React.DragEvent) => {
    const isFile = e.dataTransfer.types.includes("Files");
    const isMove = e.dataTransfer.types.includes(IMAGE_MOVE_TYPE);
    if (!isFile && !isMove) return;
    e.preventDefault();
    const target = dropTarget(e.clientY);
    setDrop(null);

    // Reordering an existing image block: move its paragraph to the drop slot.
    // Removing the source first shifts every later index down by one, so a
    // forward move lands one slot earlier than the raw target.
    if (isMove) {
      const from = Number(e.dataTransfer.getData(IMAGE_MOVE_TYPE));
      const chunks = splitChunks(post.body);
      if (!Number.isInteger(from) || from < 0 || from >= chunks.length) return;
      let to = target.index;
      if (to > from) to -= 1;
      if (to === from) return;
      const [moved] = chunks.splice(from, 1);
      chunks.splice(to, 0, moved);
      save({ ...draftFrom(post), body: chunks.join("\n\n") });
      return;
    }

    const file = imageFile(e.dataTransfer);
    if (!file) return;
    void (async () => {
      const url = await upload(file);
      if (!url) return;
      const chunks = splitChunks(post.body);
      chunks.splice(target.index, 0, url);
      save({ ...draftFrom(post), body: chunks.join("\n\n") });
    })();
  };

  /* --------------------------- edit-mode helpers ------------------------- */

  // Insert an uploaded image URL as its own paragraph at the caret.
  const insertAtCaret = (url: string) => {
    const el = textRef.current;
    setDraft((prev) => {
      const at = el ? el.selectionStart : prev.body.length;
      const before = prev.body.slice(0, at).replace(/\s+$/, "");
      const after = prev.body.slice(at).replace(/^\s+/, "");
      return {
        ...prev,
        body: `${before}${before ? "\n\n" : ""}${url}${after ? "\n\n" : ""}${after}`,
      };
    });
  };

  const addBodyImage = (file: File) => {
    void (async () => {
      const url = await upload(file);
      if (url) insertAtCaret(url);
      if (bodyFileRef.current) bodyFileRef.current.value = "";
    })();
  };

  // ⌘B / ⌘I in the body textarea: wrap the selection in the marker ("**" for
  // bold, "*" for italic) or unwrap it if that style is already applied.
  // Restores the selection after React re-renders.
  const toggleMarker = (marker: string) => {
    const el = textRef.current;
    if (!el) return;
    let { selectionStart: start, selectionEnd: end } = el;
    const { value } = el;
    const n = marker.length;

    // Fold star runs at the selection's edges out of it, so selecting
    // "**bold**" behaves the same as selecting just "bold".
    while (end - start >= 2 && value[start] === "*" && value[end - 1] === "*") {
      start++;
      end--;
    }

    // The star runs hugging the selection encode its current formatting:
    // 1 = italic, 2 = bold, 3 = both.
    let before = 0;
    while (before < 3 && value[start - 1 - before] === "*") before++;
    let after = 0;
    while (after < 3 && value[end + after] === "*") after++;
    const run = Math.min(before, after);
    const active = n === 2 ? run >= 2 : run === 1 || run === 3;

    const selected = value.slice(start, end);
    const body = active
      ? value.slice(0, start - n) + selected + value.slice(end + n)
      : value.slice(0, start) + marker + selected + marker + value.slice(end);
    const shift = active ? -n : n;

    set({ body });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + shift, end + shift);
    });
  };

  // ⌘K: wrap the selection as a [text](url) link and select the url
  // placeholder so the destination can be typed (or pasted) right away.
  const insertLink = () => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const label = value.slice(start, end) || "text";
    const body = `${value.slice(0, start)}[${label}](url)${value.slice(end)}`;
    const urlStart = start + label.length + 3; // past "[label]("
    set({ body });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(urlStart, urlStart + 3);
    });
  };

  const uploadThumbnail = (file: File) => {
    void (async () => {
      const url = await upload(file);
      // A different image means the old focal point is meaningless.
      if (url) set({ thumbnail: url, thumbnailY: 50 });
      if (thumbFileRef.current) thumbFileRef.current.value = "";
    })();
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <Field label="title">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            disabled={busy}
            className={editorField}
          />
        </Field>

        {/* Wraps on narrow screens: url takes its own line, date + status
            pair up beneath it. */}
        <div className="flex flex-wrap gap-4">
          <Field label="url" className="min-w-[12rem] flex-1">
            <input
              type="text"
              value={draft.slug}
              onChange={(e) => set({ slug: e.target.value })}
              disabled={busy}
              className={editorField}
            />
          </Field>
          <Field label="date" className="min-w-[10rem] flex-1">
            <input
              type="date"
              value={draft.date}
              onChange={(e) => set({ date: e.target.value })}
              disabled={busy}
              className={editorField}
            />
          </Field>
          <Field label="status" className="min-w-[10rem] flex-1">
            {/* Native select chevrons hug the right edge; hide them and draw
                our own so it can sit on the field's padding inset. */}
            <span className="relative block">
              <select
                value={draft.draft ? "draft" : "published"}
                onChange={(e) => set({ draft: e.target.value === "draft" })}
                disabled={busy}
                className={`${editorField} appearance-none pr-8`}
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2"
              >
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </span>
          </Field>
        </div>

        <Field label="tagline">
          <input
            type="text"
            value={draft.tagline}
            onChange={(e) => set({ tagline: e.target.value })}
            disabled={busy}
            className={editorField}
          />
        </Field>

        <div>
          <span className="mono-13 mb-1 block">
            thumbnail
            {draft.thumbnail && (
              <span className="opacity-60"> — drag the banner to reposition</span>
            )}
          </span>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={draft.thumbnail}
              onChange={(e) =>
                set({ thumbnail: e.target.value, thumbnailY: 50 })
              }
              placeholder="/images/… or upload"
              disabled={busy}
              className={editorField}
            />
            <button
              type="button"
              onClick={() => thumbFileRef.current?.click()}
              disabled={busy}
              className={`${editorButton} shrink-0`}
            >
              upload
            </button>
            {draft.thumbnail && (
              <button
                type="button"
                onClick={() => set({ thumbnail: "" })}
                disabled={busy}
                className={`${editorButton} shrink-0`}
              >
                remove
              </button>
            )}
          </div>
          {draft.thumbnail && (
            <ThumbnailBanner
              src={draft.thumbnail}
              y={draft.thumbnailY}
              onChange={(y) => set({ thumbnailY: y })}
              disabled={busy}
            />
          )}
          <input
            ref={thumbFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadThumbnail(file);
            }}
          />
        </div>

        <Field
          label={
            <>
              body
              <span className="opacity-60">
                {" "}
                — blank line splits paragraphs · &quot;# &quot; starts a
                section · &quot;- &quot; / &quot;1. &quot; list · &quot;&gt;
                &quot; quote · ``` code · &quot;---&quot; rule · a line under
                an image URL captions it · ⌘B bolds · ⌘I italicizes · ⌘K
                links
              </span>
            </>
          }
        >
          <textarea
            ref={textRef}
            value={draft.body}
            onChange={(e) => set({ body: e.target.value })}
            disabled={busy}
            onKeyDown={(e) => {
              if (!e.metaKey && !e.ctrlKey) return;
              const key = e.key.toLowerCase();
              if (key === "b" || key === "i") {
                e.preventDefault();
                toggleMarker(key === "b" ? "**" : "*");
              } else if (key === "k") {
                e.preventDefault();
                insertLink();
              }
            }}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("Files")) e.preventDefault();
            }}
            onDrop={(e) => {
              const file = imageFile(e.dataTransfer);
              if (!file) return;
              e.preventDefault();
              addBodyImage(file);
            }}
            onPaste={(e) => {
              const file = imageFile(e.clipboardData);
              if (!file) return;
              e.preventDefault();
              addBodyImage(file);
            }}
            className={editorTextarea}
          />
        </Field>
        <input
          ref={bodyFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addBodyImage(file);
          }}
        />

        {error && <p className="copy-14">{error}</p>}

        <div className="flex flex-wrap gap-6">
          <button
            type="button"
            onClick={() => save(draft)}
            disabled={busy}
            className={editorButton}
          >
            {pending ? "saving…" : "save"}
          </button>
          <button
            type="button"
            onClick={() => bodyFileRef.current?.click()}
            disabled={busy}
            className={editorButton}
          >
            {uploading ? "uploading…" : "add image"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
              setConfirmingDelete(false);
            }}
            disabled={busy}
            className={editorButton}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirmingDelete) remove();
              else setConfirmingDelete(true);
            }}
            disabled={busy}
            className={`${editorButton} ml-auto`}
          >
            {confirmingDelete ? "really delete?" : "delete post"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onDragOver={onDragOver}
      onDragLeave={() => setDrop(null)}
      onDrop={onDrop}
    >
      {children}
      {drop && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 h-px bg-foreground"
          style={{ top: drop.y }}
        />
      )}
      <div className="mt-8 flex flex-wrap gap-6">
        <button
          type="button"
          onClick={openEditor}
          disabled={busy}
          className={editorButton}
        >
          {busy ? "saving…" : "edit post"}
        </button>
        {post.draft && (
          <button
            type="button"
            onClick={() => save({ ...draftFrom(post), draft: false })}
            disabled={busy}
            className={editorButton}
          >
            publish
          </button>
        )}
      </div>
      {error && <p className="copy-14 mt-4">{error}</p>}
    </div>
  );
}
