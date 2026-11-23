"use client";

import { useEffect, useId, useRef, useState } from "react";

export function ClipPreview({
  sources,
  label,
  href,
  width,
  height,
  fullResolution = false,
  optimizedPreview = false,
}: {
  sources: string[];
  label: string;
  href?: string;
  width: number;
  height: number;
  fullResolution?: boolean;
  optimizedPreview?: boolean;
}) {
  const previewsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeSource = activeIndex === null ? undefined : sources[activeIndex];
  // Load the matching HD file only in the expanded player.
  const expandedSource = fullResolution
    ? activeSource?.replace(/\.mp4$/, "-hd.mp4")
    : activeSource;

  const activeLabel =
    sources.length > 1 && activeIndex !== null
      ? `${label} (${activeIndex + 1} of ${sources.length})`
      : label;

  useEffect(() => {
    const previews = previewsRef.current;
    if (!previews || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, intersectionRatio } of entries) {
          if (!(target instanceof HTMLVideoElement)) continue;
          const source = target.dataset.previewSrc;

          if (intersectionRatio >= 0.1 && source) {
            if (!target.getAttribute("src")) target.src = source;
            if (target.paused) void target.play().catch(() => {});
          } else {
            target.pause();
          }
        }
      },
      { threshold: 0.1 },
    );

    previews.querySelectorAll("video").forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [sources]);

  return (
    <>
      <div ref={previewsRef} className="grid w-full grid-flow-col auto-cols-fr gap-2">
        {sources.map((src, index) => (
          <button
            key={src}
            type="button"
            className="block min-w-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-haspopup="dialog"
            aria-label={
              sources.length > 1
                ? `Expand ${label} (${index + 1} of ${sources.length})`
                : `Expand ${label}`
            }
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setActiveIndex(index);
              dialogRef.current?.showModal();
              closeRef.current?.focus({ preventScroll: true });
            }}
          >
            <video
              data-preview-src={
                optimizedPreview ? src.replace(/\.mp4$/, "-preview.mp4") : src
              }
              poster={
                optimizedPreview ? src.replace(/\.mp4$/, "-poster.jpg") : undefined
              }
              width={width}
              height={height}
              preload="none"
              muted
              loop
              playsInline
              className="block h-auto w-full bg-background-200"
            />
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-auto border border-border bg-background text-foreground backdrop:bg-black/80"
        onClick={(event) => {
          const dialog = event.currentTarget;
          if (event.target !== dialog) return;

          const { left, right, top, bottom } = dialog.getBoundingClientRect();
          if (
            event.clientX < left ||
            event.clientX > right ||
            event.clientY < top ||
            event.clientY > bottom
          ) {
            dialog.close();
          }
        }}
        onClose={() => {
          setActiveIndex(null);
          triggerRef.current?.focus();
        }}
      >
        <div className="flex items-center justify-between gap-4 px-3 py-2">
          <h2 id={titleId} className="copy-14">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-glow"
              >
                {activeLabel} ↗
              </a>
            ) : (
              activeLabel
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="link-glow shrink-0 cursor-pointer px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
        {expandedSource && (
          <video
            src={expandedSource}
            width={width}
            height={height}
            autoPlay
            loop
            playsInline
            controls
            className="block h-auto"
            style={{
              width: `min(80rem, calc(100vw - 2rem), calc((100dvh - 6rem) * ${width / height}))`,
            }}
          />
        )}
      </dialog>
    </>
  );
}
