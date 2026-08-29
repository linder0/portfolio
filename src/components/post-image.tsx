"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCanEdit } from "@/components/marginalia";
import { RawImage } from "@/components/raw-image";
import { ThemedMark } from "@/components/themed-mark";
import { draftFrom } from "@/lib/post-draft";
import { projectDraftFrom, projectId } from "@/lib/project-draft";
import { updatePost, updateProject } from "@/app/actions";
import {
  rewriteImageRowGap,
  rewriteImageRowWidth,
  rewriteImageWidth,
  splitChunks,
  type Post,
} from "@/lib/writing";
import type { Project } from "@/lib/projects";

const MIN_WIDTH = 120;

const HANDLE_CLASS =
  "absolute top-1/2 h-12 max-h-[50%] w-1.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100";

// dataTransfer key for dragging an existing image block to a new position in
// the body (owner-only, WYSIWYG reorder). The value is the source paragraph
// index. Custom drag types are lowercased by the browser — keep it lowercase.
export const IMAGE_MOVE_TYPE = "application/x-post-image-index";

/* ---------------------------------------------------------------------------
   ResizableImage — Notion-style image sizing. Hover shows pill handles on the
   left/right edges; dragging one scales the image (aspect ratio locked,
   capped to the column). Releasing calls `onCommit` with the final pixel
   width — the caller decides how to store it (the post page persists it
   immediately; the inline editor keeps it in the draft until save).
   ------------------------------------------------------------------------- */

export function ResizableImage({
  src,
  darkSrc,
  width,
  knockout,
  onCommit,
  className,
}: {
  src: string;
  // Dark-theme variant; both render and CSS shows the current one, so the
  // container (not the possibly-hidden light image) is what gets measured.
  darkSrc?: string;
  width?: number;
  // Logo: drop the baked-in plate (ThemedMark). Screenshot pairs omit this.
  knockout?: boolean;
  onCommit: (width: number) => void;
  className?: string;
}) {
  const [w, setW] = useState<number | null>(width ?? null);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local width in sync with the value from above (e.g. after a server
  // re-render), but never mid-drag. Render-phase reset, not an effect.
  const [prevWidth, setPrevWidth] = useState(width);
  if (width !== prevWidth) {
    setPrevWidth(width);
    if (!dragging) setW(width ?? null);
  }

  const startDrag = (side: "left" | "right", e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
    const max =
      containerRef.current?.parentElement?.getBoundingClientRect().width ??
      Infinity;
    setDragging(true);

    let latest = startWidth;
    const onMove = (ev: PointerEvent) => {
      const delta =
        side === "right" ? ev.clientX - startX : startX - ev.clientX;
      latest = Math.min(max, Math.max(MIN_WIDTH, startWidth + delta));
      setW(latest);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      onCommit(Math.round(latest));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div ref={containerRef} className="group relative inline-block max-w-full">
      {knockout ? (
        <ThemedMark
          src={src}
          darkSrc={darkSrc}
          imgClassName={`h-auto max-w-full select-none${className ? ` ${className}` : ""}`}
          style={w ? { width: w } : undefined}
        />
      ) : (
        <>
          <RawImage
            src={src}
            draggable={false}
            className={`h-auto max-w-full select-none ${
              darkSrc ? "block dark:hidden" : "block"
            }${className ? ` ${className}` : ""}`}
            style={w ? { width: w } : undefined}
          />
          {darkSrc && (
            <RawImage
              src={darkSrc}
              draggable={false}
              className={`hidden h-auto max-w-full select-none dark:block${
                className ? ` ${className}` : ""
              }`}
              style={w ? { width: w } : undefined}
            />
          )}
        </>
      )}
      <span
        role="presentation"
        onPointerDown={(e) => startDrag("left", e)}
        className={`${HANDLE_CLASS} left-1.5 ${dragging ? "opacity-100" : ""}`}
      />
      <span
        role="presentation"
        onPointerDown={(e) => startDrag("right", e)}
        className={`${HANDLE_CLASS} right-1.5 ${dragging ? "opacity-100" : ""}`}
      />
    </div>
  );
}

// The default spacing between a row's images (the gutter, gap-6).
export const ROW_GAP = 24;

// A side-by-side row is one object: handles sit on the group's outer edges
// and every image scales together (same width, locked). The space between
// images is a real spacer element carrying a Figma-style gap handle —
// dragging it adjusts the row's gap, committed via `onCommitGap`.
function ResizableImageRow({
  images,
  gap,
  onCommit,
  onCommitGap,
  className,
}: {
  images: { src: string; width?: number }[];
  gap?: number;
  onCommit: (width: number) => void;
  onCommitGap: (gap: number) => void;
  className?: string;
}) {
  const shared = images.find((image) => image.width)?.width ?? null;
  const [w, setW] = useState<number | null>(shared);
  const [g, setG] = useState(gap ?? ROW_GAP);
  const [dragging, setDragging] = useState(false);
  const [draggingGap, setDraggingGap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [prevWidth, setPrevWidth] = useState(shared);
  if (shared !== prevWidth) {
    setPrevWidth(shared);
    if (!dragging) setW(shared);
  }
  const [prevGap, setPrevGap] = useState(gap);
  if (gap !== prevGap) {
    setPrevGap(gap);
    if (!draggingGap) setG(gap ?? ROW_GAP);
  }

  const startDrag = (side: "left" | "right", e: React.PointerEvent) => {
    e.preventDefault();
    const n = images.length;
    if (n < 1) return;
    const startX = e.clientX;
    const box = containerRef.current?.getBoundingClientRect();
    const startPer = box ? (box.width - g * (n - 1)) / n : (w ?? MIN_WIDTH);
    const maxColumn =
      containerRef.current?.parentElement?.getBoundingClientRect().width ??
      Infinity;
    const maxPer = (maxColumn - g * (n - 1)) / n;
    setDragging(true);

    // The group's outer edge follows the cursor; width is then split evenly
    // so every image grows or shrinks by the same amount.
    let latest = startPer;
    const onMove = (ev: PointerEvent) => {
      const delta =
        side === "right" ? ev.clientX - startX : startX - ev.clientX;
      latest = Math.min(maxPer, Math.max(MIN_WIDTH, startPer + delta / n));
      setW(latest);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      onCommit(Math.round(latest));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startGapDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const n = images.length;
    if (n < 2) return;
    const startX = e.clientX;
    const startGap = g;
    const box = containerRef.current?.getBoundingClientRect();
    const maxColumn =
      containerRef.current?.parentElement?.getBoundingClientRect().width ??
      Infinity;
    // The images keep their width; the gap can grow until the row fills the
    // column (and shrink to zero, images touching).
    const imagesWidth = box ? box.width - startGap * (n - 1) : 0;
    const maxGap = Math.max(0, (maxColumn - imagesWidth) / (n - 1));
    setDraggingGap(true);

    let latest = startGap;
    const onMove = (ev: PointerEvent) => {
      latest = Math.min(maxGap, Math.max(0, startGap + (ev.clientX - startX)));
      setG(latest);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDraggingGap(false);
      onCommitGap(Math.round(latest));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={containerRef}
      className="group relative inline-flex max-w-full flex-nowrap items-start"
    >
      {images.map((image, i) => (
        <Fragment key={image.src}>
          {i > 0 && (
            <div
              role="presentation"
              onPointerDown={startGapDrag}
              style={{ width: g }}
              className="relative shrink-0 cursor-ew-resize self-stretch"
            >
              <span
                className={`absolute left-1/2 top-1/2 h-8 max-h-[33%] w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 ${
                  draggingGap ? "opacity-100" : ""
                }`}
              />
            </div>
          )}
          <RawImage
            src={image.src}
            draggable={false}
            className={`h-auto max-w-full select-none${
              className ? ` ${className}` : ""
            }`}
            style={w ? { width: w } : undefined}
          />
        </Fragment>
      ))}
      <span
        role="presentation"
        onPointerDown={(e) => startDrag("left", e)}
        className={`${HANDLE_CLASS} left-1.5 ${dragging ? "opacity-100" : ""}`}
      />
      <span
        role="presentation"
        onPointerDown={(e) => startDrag("right", e)}
        className={`${HANDLE_CLASS} right-1.5 ${dragging ? "opacity-100" : ""}`}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Editable body images — visitors get a plain image at its stored width; the
   signed-in owner gets resize handles, and a released drag persists the
   width into the body text as "<url> <px>" (or one side of a ` | ` row),
   keeping any caption lines under the URL. The caption itself arrives
   pre-rendered from the server page (it goes through the same rich-text and
   marginalia pipeline as body paragraphs).
   ------------------------------------------------------------------------- */

function MoveGrip({ index }: { index: number }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(IMAGE_MOVE_TYPE, String(index));
      }}
      title="Drag to move"
      aria-hidden
      className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover/move:opacity-100 active:cursor-grabbing"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 12 12"
        className="text-white [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.6))]"
      >
        <g fill="currentColor">
          <circle cx="4" cy="2.5" r="1" />
          <circle cx="8" cy="2.5" r="1" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="8" cy="6" r="1" />
          <circle cx="4" cy="9.5" r="1" />
          <circle cx="8" cy="9.5" r="1" />
        </g>
      </svg>
    </div>
  );
}

function EditableBodyImage({
  body,
  index,
  src,
  darkSrc,
  width,
  knockout,
  caption,
  className,
  saveBody,
}: {
  body: string;
  index: number;
  src: string;
  darkSrc?: string;
  width?: number;
  knockout?: boolean;
  caption?: React.ReactNode;
  className?: string;
  saveBody: (body: string) => Promise<unknown>;
}) {
  const canEdit = useCanEdit();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const figcaption = caption && (
    <figcaption className="copy-14 mt-2 opacity-60">{caption}</figcaption>
  );

  if (!canEdit) {
    return (
      <figure data-post-block>
        {knockout ? (
          <ThemedMark
            src={src}
            darkSrc={darkSrc}
            imgClassName={`h-auto max-w-full${className ? ` ${className}` : ""}`}
            style={width ? { width } : undefined}
          />
        ) : (
          <>
            <RawImage
              src={src}
              className={`h-auto max-w-full ${
                darkSrc ? "block dark:hidden" : "block"
              }${className ? ` ${className}` : ""}`}
              style={width ? { width } : undefined}
            />
            {darkSrc && (
              <RawImage
                src={darkSrc}
                className={`hidden h-auto max-w-full dark:block${
                  className ? ` ${className}` : ""
                }`}
                style={width ? { width } : undefined}
              />
            )}
          </>
        )}
        {figcaption}
      </figure>
    );
  }

  const persist = (finalWidth: number) => {
    startTransition(async () => {
      const chunks = splitChunks(body);
      chunks[index] = rewriteImageWidth(chunks[index], src, finalWidth);
      await saveBody(chunks.join("\n\n"));
      router.refresh();
    });
  };

  return (
    <figure data-post-block className="group/move relative">
      <MoveGrip index={index} />
      <ResizableImage
        src={src}
        darkSrc={darkSrc}
        width={width}
        knockout={knockout}
        className={className}
        onCommit={persist}
      />
      {figcaption}
    </figure>
  );
}

export function PostImage({
  post,
  index,
  src,
  darkSrc,
  width,
  knockout,
  caption,
}: {
  post: Post;
  index: number;
  src: string;
  darkSrc?: string;
  width?: number;
  knockout?: boolean;
  caption?: React.ReactNode;
}) {
  return (
    <EditableBodyImage
      body={post.body}
      index={index}
      src={src}
      darkSrc={darkSrc}
      width={width}
      knockout={knockout}
      caption={caption}
      saveBody={(body) => updatePost(post.id, { ...draftFrom(post), body })}
    />
  );
}

export function ProjectImage({
  project,
  index,
  src,
  darkSrc,
  width,
  knockout,
  caption,
}: {
  project: Project;
  index: number;
  src: string;
  darkSrc?: string;
  width?: number;
  knockout?: boolean;
  caption?: React.ReactNode;
}) {
  return (
    <EditableBodyImage
      body={project.body ?? ""}
      index={index}
      src={src}
      darkSrc={darkSrc}
      width={width}
      knockout={knockout}
      caption={caption}
      saveBody={(body) =>
        updateProject(projectId(project), {
          ...projectDraftFrom(project),
          body,
        })
      }
    />
  );
}

export function BodyImageRow({
  body,
  index,
  images,
  gap,
  caption,
  saveBody,
}: {
  body: string;
  index: number;
  images: { src: string; width?: number }[];
  gap?: number;
  caption?: React.ReactNode;
  saveBody: (body: string) => Promise<unknown>;
}) {
  const canEdit = useCanEdit();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const figcaption = caption && (
    <figcaption className="copy-14 mt-2 opacity-60">{caption}</figcaption>
  );

  const persist = (finalWidth: number) => {
    startTransition(async () => {
      const chunks = splitChunks(body);
      chunks[index] = rewriteImageRowWidth(chunks[index], finalWidth);
      await saveBody(chunks.join("\n\n"));
      router.refresh();
    });
  };

  const persistGap = (finalGap: number) => {
    startTransition(async () => {
      const chunks = splitChunks(body);
      chunks[index] = rewriteImageRowGap(chunks[index], finalGap);
      await saveBody(chunks.join("\n\n"));
      router.refresh();
    });
  };

  return (
    <figure
      data-post-block
      className={canEdit ? "group/move relative" : undefined}
    >
      {canEdit && <MoveGrip index={index} />}
      {canEdit ? (
        <ResizableImageRow
          images={images}
          gap={gap}
          className="rounded-xl"
          onCommit={persist}
          onCommitGap={persistGap}
        />
      ) : (
        <div
          className="flex max-w-full flex-nowrap items-start"
          style={{ columnGap: gap ?? ROW_GAP }}
        >
          {images.map((image) => (
            <RawImage
              key={image.src}
              src={image.src}
              className="h-auto max-w-full rounded-xl"
              style={
                image.width
                  ? { width: image.width }
                  : { width: `calc(50% - ${(gap ?? ROW_GAP) / 2}px)` }
              }
            />
          ))}
        </div>
      )}
      {figcaption}
    </figure>
  );
}

export function PostImageRow({
  post,
  index,
  images,
  gap,
  caption,
}: {
  post: Post;
  index: number;
  images: { src: string; width?: number }[];
  gap?: number;
  caption?: React.ReactNode;
}) {
  return (
    <BodyImageRow
      body={post.body}
      index={index}
      images={images}
      gap={gap}
      caption={caption}
      saveBody={(body) => updatePost(post.id, { ...draftFrom(post), body })}
    />
  );
}

export function ProjectImageRow({
  project,
  index,
  images,
  gap,
  caption,
}: {
  project: Project;
  index: number;
  images: { src: string; width?: number }[];
  gap?: number;
  caption?: React.ReactNode;
}) {
  return (
    <BodyImageRow
      body={project.body ?? ""}
      index={index}
      images={images}
      gap={gap}
      caption={caption}
      saveBody={(body) =>
        updateProject(projectId(project), {
          ...projectDraftFrom(project),
          body,
        })
      }
    />
  );
}
