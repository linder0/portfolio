"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Project, ProjectMedia as Media } from "@/lib/projects";
import { projectDraftFrom, projectId } from "@/lib/project-draft";
import { updateProject } from "@/app/actions";
import { useCanEdit } from "@/components/marginalia";
import { TweetEmbed } from "@/components/tweet-embed";

// The media column is capped at the reading measure (37.5rem = 600px); tell
// next/image so it never serves a wider variant than the layout can show.
const MEDIA_SIZES = "(min-width: 640px) 600px, 100vw";

// Default spacing between gallery items (the gutter); the owner can adjust
// it per project by dragging the space between items (stored as mediaGap).
const DEFAULT_GAP = 24;
const MAX_GAP = 96;

function isEmbed(item: Media): boolean {
  return item.type === "youtube" || item.type === "tweet";
}

function mediaKey(item: Media): string {
  return "src" in item ? item.src : `${item.type}-${item.id}`;
}

// Consecutive YouTube/tweet embeds share a row (two per row, leftover in
// the left slot). Images, video, and audio stay full-width on their own.
function mediaRows(media: Media[]): Media[][] {
  const rows: Media[][] = [];
  let embeds: Media[] = [];
  const flushEmbeds = () => {
    while (embeds.length) rows.push(embeds.splice(0, 2));
  };
  for (const item of media) {
    if (isEmbed(item)) {
      embeds.push(item);
      continue;
    }
    flushEmbeds();
    rows.push([item]);
  }
  flushEmbeds();
  return rows;
}

function MediaFigure({ item }: { item: Media }) {
  return (
    <figure className="m-0 min-w-0">
      {item.type === "audio" ? (
        // Sound work stays a bare player — a card around a scrubber is noise.
        <audio
          src={item.src}
          controls
          preload="metadata"
          className="block w-full"
        />
      ) : item.type === "tweet" ? (
        // The tweet widget is already a card of its own (chrome we can't
        // restyle from outside the iframe) — no extra plate around it.
        <TweetEmbed id={item.id} />
      ) : item.type === "youtube" ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-background-200">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${item.id}`}
            title={item.label ?? "Demo video"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="block h-full w-full border-0"
          />
        </div>
      ) : (
        <div
          // The card: flush media clipped to the slight radius, with the
          // raised background-200 well showing through any letterboxing.
          className="w-full overflow-hidden rounded-xl bg-background-200"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
        >
          {item.type === "video" ? (
            item.autoplay ? (
              // GIF-style clip: plays silently on a loop, no chrome.
              <video
                src={item.src}
                autoPlay
                muted
                loop
                playsInline
                className="block h-full w-full object-contain"
              />
            ) : (
              <video
                src={item.src}
                poster={item.poster}
                controls
                playsInline
                preload="metadata"
                className="block h-full w-full object-contain"
              />
            )
          ) : (
            <Image
              src={item.src}
              alt={item.label ?? ""}
              width={item.width}
              height={item.height}
              sizes={MEDIA_SIZES}
              className="block h-full w-full object-contain"
            />
          )}
        </div>
      )}
      {/* Captions are optional — no label, no figcaption. */}
      {item.label ? (
        <figcaption className="label-eyebrow mt-2">{item.label}</figcaption>
      ) : null}
    </figure>
  );
}

function MediaRow({ row, gap }: { row: Media[]; gap: number }) {
  return isEmbed(row[0]) ? (
    <div
      className="grid grid-cols-1 items-start sm:grid-cols-2"
      style={{ gap }}
    >
      {row.map((item) => (
        <MediaFigure key={mediaKey(item)} item={item} />
      ))}
    </div>
  ) : (
    <MediaFigure item={row[0]} />
  );
}

// The media gallery on a project detail page: images, videos, audio, and
// embedded demos (YouTube, X posts). Visual media carries intrinsic
// dimensions so the aspect ratio is set up front and nothing reflows as
// assets load; audio is a bare player; embeds bring their own chrome
// (tweets via the client-side TweetEmbed, since widgets.js only runs in
// the browser). Demos and tweets sit two to a row; everything else is
// full-width.
//
// The spacing between items is one adjustable value (Project.mediaGap):
// the signed-in owner drags the space between stacked items — a
// Figma-style gap handle — and the same value drives the gap inside
// paired embed rows. Committed through updateProject like body edits.
export function ProjectMedia({ project }: { project: Project }) {
  const canEdit = useCanEdit();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [g, setG] = useState(project.mediaGap ?? DEFAULT_GAP);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);

  // Keep local gap in sync with the server value, but never mid-drag.
  const [prevGap, setPrevGap] = useState(project.mediaGap);
  if (project.mediaGap !== prevGap) {
    setPrevGap(project.mediaGap);
    if (!draggingRef.current) setG(project.mediaGap ?? DEFAULT_GAP);
  }

  const rows = mediaRows(project.media ?? []);

  const startGapDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startGap = g;
    setDragging(true);
    draggingRef.current = true;

    let latest = startGap;
    const onMove = (ev: PointerEvent) => {
      latest = Math.min(
        MAX_GAP,
        Math.max(0, startGap + (ev.clientY - startY)),
      );
      setG(latest);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      draggingRef.current = false;
      const gap = Math.round(latest);
      startTransition(async () => {
        await updateProject(projectId(project), {
          ...projectDraftFrom(project),
          mediaGap: gap,
        });
        router.refresh();
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (!canEdit) {
    return (
      // No rule, no extra break: media flows on from the body like figures
      // in a blog post, at the project's stored gap.
      <div className="mt-12 flex flex-col" style={{ rowGap: g }}>
        {rows.map((row) => (
          <MediaRow key={row.map(mediaKey).join("|")} row={row} gap={g} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col">
      {rows.map((row, i) => (
        <Fragment key={row.map(mediaKey).join("|")}>
          {i > 0 && (
            // The gap itself is the drag surface (like Figma's spacing
            // handle) — drag vertically to adjust the whole gallery's gap.
            <div
              role="presentation"
              onPointerDown={startGapDrag}
              style={{ height: g }}
              className="group/gap relative shrink-0 cursor-ns-resize"
            >
              <span
                className={`absolute left-1/2 top-1/2 h-1.5 w-12 max-w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover/gap:opacity-100 ${
                  dragging ? "opacity-100" : ""
                }`}
              />
            </div>
          )}
          <MediaRow row={row} gap={g} />
        </Fragment>
      ))}
    </div>
  );
}
