"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCanEdit } from "@/components/marginalia";
import { splitChunks } from "@/lib/writing";
import { projectDraftFrom, projectId, type ProjectDraft } from "@/lib/project-draft";
import type { Project } from "@/lib/projects";
import {
  editorButton,
  editorField,
  editorTextarea,
} from "@/components/form-classes";
import { RawImage } from "@/components/raw-image";
import { useImageUpload } from "@/components/use-image-upload";
import { IMAGE_MOVE_TYPE } from "@/components/post-image";
import { updateProject } from "@/app/actions";

/* ---------------------------------------------------------------------------
   ProjectBody — wraps a project's server-rendered copy (`children`) with the
   owner's inline editing tools, mirroring PostBody. Visitors just see the
   children. When signed in:

   - "edit project" swaps the copy for a form over title, url (slug), year,
     tagline, thumbnail, description, and the body as one text box (same
     plain-text conventions as posts; a line of two image URLs joined by
     ` | ` renders them side by side; resize images on the rendered page
     after saving).
   - Images can be dragged onto the *rendered* body — a hairline shows where
     they'll land between paragraphs — or dropped/pasted into the textarea.

   Saves go through the `updateProject` server action and re-render via
   router.refresh(). Renaming the url navigates to the new address.
   ------------------------------------------------------------------------- */

function imageFile(dt: DataTransfer): File | null {
  const file = Array.from(dt.files).find((f) => f.type.startsWith("image/"));
  return file ?? null;
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

export function ProjectBody({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const canEdit = useCanEdit();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft>(() =>
    projectDraftFrom(project),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { uploading, upload } = useImageUpload();
  const [drop, setDrop] = useState<{ index: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const bodyFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);
  const busy = pending || uploading;
  const id = projectId(project);

  if (!canEdit) return <>{children}</>;

  const set = (patch: Partial<ProjectDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const openEditor = () => {
    setDraft(projectDraftFrom(project));
    setError(null);
    setEditing(true);
  };

  const save = (next: ProjectDraft) => {
    setError(null);
    startTransition(async () => {
      const result = await updateProject(id, next);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setEditing(false);
      if (result.saved.slug !== project.slug) {
        router.push(
          window.location.pathname.replace(/[^/]+\/?$/, result.saved.slug),
        );
      }
      router.refresh();
    });
  };

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

    if (isMove) {
      const from = Number(e.dataTransfer.getData(IMAGE_MOVE_TYPE));
      const chunks = splitChunks(project.body ?? "");
      if (!Number.isInteger(from) || from < 0 || from >= chunks.length) return;
      let to = target.index;
      if (to > from) to -= 1;
      if (to === from) return;
      const [moved] = chunks.splice(from, 1);
      chunks.splice(to, 0, moved);
      save({ ...projectDraftFrom(project), body: chunks.join("\n\n") });
      return;
    }

    const file = imageFile(e.dataTransfer);
    if (!file) return;
    void (async () => {
      const url = await upload(file);
      if (!url) return;
      const chunks = splitChunks(project.body ?? "");
      chunks.splice(target.index, 0, url);
      save({ ...projectDraftFrom(project), body: chunks.join("\n\n") });
    })();
  };

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

  const toggleMarker = (marker: string) => {
    const el = textRef.current;
    if (!el) return;
    let { selectionStart: start, selectionEnd: end } = el;
    const { value } = el;
    const n = marker.length;

    while (end - start >= 2 && value[start] === "*" && value[end - 1] === "*") {
      start++;
      end--;
    }

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

  const insertLink = () => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const label = value.slice(start, end) || "text";
    const body = `${value.slice(0, start)}[${label}](url)${value.slice(end)}`;
    const urlStart = start + label.length + 3;
    set({ body });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(urlStart, urlStart + 3);
    });
  };

  const uploadThumbnail = (file: File) => {
    void (async () => {
      const url = await upload(file);
      if (url) set({ thumbnail: url });
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
          <Field label="year" className="min-w-[6rem]">
            <input
              type="text"
              inputMode="numeric"
              value={draft.year}
              onChange={(e) => set({ year: e.target.value })}
              disabled={busy}
              className={editorField}
            />
          </Field>
          <Field label="status" className="min-w-[10rem] flex-1">
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
          <span className="mono-13 mb-1 block">thumbnail</span>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={draft.thumbnail}
              onChange={(e) => set({ thumbnail: e.target.value })}
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
            <RawImage
              src={draft.thumbnail}
              className="mt-3 h-14 w-14 rounded-xl object-cover"
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

        <Field label="description">
          <textarea
            value={draft.description}
            onChange={(e) => set({ description: e.target.value })}
            disabled={busy}
            className={`${editorField} min-h-24 resize-y`}
          />
        </Field>

        <Field
          label={
            <>
              body
              <span className="opacity-60">
                {" "}
                — blank line splits paragraphs · &quot;# &quot; starts a
                section · two image URLs on one line joined by &quot; | &quot;
                sit side by side (&quot;gap 12&quot; at the end sets their
                spacing) · &quot;knockout&quot; after a logo URL drops its
                plate · &quot;frame&quot; after an image or video URL makes
                it a full-pane frame · a line under an image URL captions it
                · ⌘B bolds · ⌘I italicizes · ⌘K links
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
            }}
            disabled={busy}
            className={editorButton}
          >
            cancel
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
          {busy ? "saving…" : "edit project"}
        </button>
        {project.draft && (
          <button
            type="button"
            onClick={() => save({ ...projectDraftFrom(project), draft: false })}
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
