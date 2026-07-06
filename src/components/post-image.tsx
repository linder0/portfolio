"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMargin } from "@/components/marginalia";
import { RawImage } from "@/components/raw-image";
import { draftFrom } from "@/lib/post-draft";
import { updatePost } from "@/app/actions";
import { splitChunks, type Post } from "@/lib/writing";

const MIN_WIDTH = 120;

/* ---------------------------------------------------------------------------
   ResizableImage — Notion-style image sizing. Hover shows pill handles on the
   left/right edges; dragging one scales the image (aspect ratio locked,
   capped to the column). Releasing calls `onCommit` with the final pixel
   width — the caller decides how to store it (the post page persists it
   immediately; the inline editor keeps it in the draft until save).
   ------------------------------------------------------------------------- */

export function ResizableImage({
  src,
  width,
  onCommit,
}: {
  src: string;
  width?: number;
  onCommit: (width: number) => void;
}) {
  const [w, setW] = useState<number | null>(width ?? null);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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
    const startWidth = imgRef.current?.getBoundingClientRect().width ?? 0;
    const max =
      imgRef.current?.parentElement?.parentElement?.getBoundingClientRect()
        .width ?? Infinity;
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
    <div className="group relative inline-block max-w-full">
      <RawImage
        ref={imgRef}
        src={src}
        draggable={false}
        className="block h-auto max-w-full select-none"
        style={w ? { width: w } : undefined}
      />
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
  width,
  caption,
}: {
  post: Post;
  // The image's paragraph index in the post body.
  index: number;
  src: string;
  width?: number;
  caption?: React.ReactNode;
}) {
  const { canEdit } = useMargin();
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
          className="block h-auto max-w-full"
          style={width ? { width } : undefined}
        />
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
    <figure data-post-block>
      <ResizableImage src={src} width={width} onCommit={persist} />
      {figcaption}
    </figure>
  );
}
