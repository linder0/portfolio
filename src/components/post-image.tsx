"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCanEdit } from "@/components/marginalia";
import { RawImage } from "@/components/raw-image";
import { draftFrom } from "@/lib/post-draft";
import { updatePost } from "@/app/actions";
import { splitChunks, type Post } from "@/lib/writing";

const MIN_WIDTH = 120;

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
  onCommit,
}: {
  src: string;
  // Dark-theme variant; both render and CSS shows the current one, so the
  // container (not the possibly-hidden light image) is what gets measured.
  darkSrc?: string;
  width?: number;
  onCommit: (width: number) => void;
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

  const handleClass =
    "absolute top-1/2 h-12 max-h-[50%] w-1.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100";

  return (
    <div ref={containerRef} className="group relative inline-block max-w-full">
      <RawImage
        src={src}
        draggable={false}
        className={`h-auto max-w-full select-none ${
          darkSrc ? "block dark:hidden" : "block"
        }`}
        style={w ? { width: w } : undefined}
      />
      {darkSrc && (
        <RawImage
          src={darkSrc}
          draggable={false}
          className="hidden h-auto max-w-full select-none dark:block"
          style={w ? { width: w } : undefined}
        />
      )}
      <span
        role="presentation"
        onPointerDown={(e) => startDrag("left", e)}
        className={`${handleClass} left-1.5 ${dragging ? "opacity-100" : ""}`}
      />
      <span
        role="presentation"
        onPointerDown={(e) => startDrag("right", e)}
        className={`${handleClass} right-1.5 ${dragging ? "opacity-100" : ""}`}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PostImage — an image block on the rendered post page. Visitors get a plain
   image at its stored width; the signed-in owner gets resize handles, and a
   released drag persists the width into the body text as "<url> <px>" —
   keeping any caption lines under the URL. The caption itself arrives
   pre-rendered from the server page (it goes through the same rich-text and
   marginalia pipeline as body paragraphs).
   ------------------------------------------------------------------------- */

export function PostImage({
  post,
  index,
  src,
  darkSrc,
  width,
  caption,
}: {
  post: Post;
  // The image's paragraph index in the post body.
  index: number;
  src: string;
  darkSrc?: string;
  width?: number;
  caption?: React.ReactNode;
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
        <RawImage
          src={src}
          className={`h-auto max-w-full ${
            darkSrc ? "block dark:hidden" : "block"
          }`}
          style={width ? { width } : undefined}
        />
        {darkSrc && (
          <RawImage
            src={darkSrc}
            className="hidden h-auto max-w-full dark:block"
            style={width ? { width } : undefined}
          />
        )}
        {figcaption}
      </figure>
    );
  }

  const persist = (finalWidth: number) => {
    startTransition(async () => {
      const chunks = splitChunks(post.body);
      // Rewrite only the URL line; caption lines below it stay as they are.
      const [, ...captionLines] = chunks[index].split("\n");
      chunks[index] = [`${src} ${finalWidth}`, ...captionLines].join("\n");
      await updatePost(post.id, {
        ...draftFrom(post),
        body: chunks.join("\n\n"),
      });
      router.refresh();
    });
  };

  return (
    <figure data-post-block className="group/move relative">
      {/* Google-Docs-style move affordance: a grip that appears on hover and
          initiates a native drag; PostBody's body wrapper shows the drop line
          and reorders the paragraph on release. */}
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
      <ResizableImage
        src={src}
        darkSrc={darkSrc}
        width={width}
        onCommit={persist}
      />
      {figcaption}
    </figure>
  );
}
