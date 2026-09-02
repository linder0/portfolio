import Image from "next/image";
import type { Project, ProjectMedia as Media } from "@/lib/projects";
import { TweetEmbed } from "@/components/tweet-embed";
import { AudioCard } from "@/components/audio-card";
import { MEDIA_CAPTION_CLASS } from "@/components/media-caption";

// The media column is capped at the reading measure (37.5rem = 600px); tell
// next/image so it never serves a wider variant than the layout can show.
const MEDIA_SIZES = "(min-width: 640px) 600px, 100vw";

// Paired items sit two to a row above the sm breakpoint — half the measure.
const HALF_MEDIA_SIZES = "(min-width: 640px) 300px, 100vw";
const THIRD_MEDIA_SIZES = "(min-width: 640px) 200px, 100vw";

function isEmbed(item: Media): boolean {
  return (
    item.type === "youtube" || item.type === "tweet" || item.type === "slides"
  );
}

function mediaKey(item: Media): string {
  return "src" in item ? item.src : `${item.type}-${item.id}`;
}

// Items that share a row: embeds always do, and images/videos opt in with
// `pair: true` (a two-column arrangement).
function pairsUp(item: Media): boolean {
  return isEmbed(item) || ("pair" in item && item.pair === true);
}

type MediaRowData = {
  items: Media[];
  columns: 1 | 2 | 3;
};

function rowColumns(item: Media): 1 | 2 | 3 {
  if ("columns" in item && item.columns) return item.columns;
  return pairsUp(item) ? 2 : 1;
}

// Consecutive grouped items share rows of their requested size. Everything
// else stays full-width on its own.
function mediaRows(media: Media[]): MediaRowData[] {
  const rows: MediaRowData[] = [];
  const grouped: Media[] = [];
  let groupedColumns: 2 | 3 = 2;
  const flushGrouped = () => {
    while (grouped.length) {
      rows.push({
        items: grouped.splice(0, groupedColumns),
        columns: groupedColumns,
      });
    }
  };

  for (const item of media) {
    const columns = rowColumns(item);
    if (columns !== 1) {
      if (grouped.length && columns !== groupedColumns) flushGrouped();
      groupedColumns = columns;
      grouped.push(item);
      if (grouped.length === groupedColumns) flushGrouped();
      continue;
    }
    flushGrouped();
    rows.push({ items: [item], columns: 1 });
  }
  flushGrouped();
  return rows;
}

function MediaFigure({
  item,
  columns = 1,
}: {
  item: Media;
  columns?: 1 | 2 | 3;
}) {
  return (
    <figure className="m-0 min-w-0">
      {item.type === "audio" ? (
        // Sound work gets its own card — play button, label, and a hairline
        // scrubber on the raised well, in place of the browser's player.
        <AudioCard src={item.src} label={item.label} />
      ) : item.type === "tweet" ? (
        // The tweet widget is already a card of its own (chrome we can't
        // restyle from outside the iframe) — no extra plate around it.
        <TweetEmbed id={item.id} />
      ) : item.type === "slides" ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-background-200">
          <iframe
            src={`https://docs.google.com/presentation/d/${item.id}/embed?start=false&loop=false`}
            title={item.label ?? "Presentation"}
            loading="lazy"
            allowFullScreen
            className="block h-full w-full rounded-xl border-0"
          />
        </div>
      ) : item.type === "youtube" ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-background-200">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${item.id}`}
            title={item.label ?? "Demo video"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="block h-full w-full rounded-xl border-0"
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
              sizes={
                columns === 3
                  ? THIRD_MEDIA_SIZES
                  : columns === 2
                    ? HALF_MEDIA_SIZES
                    : MEDIA_SIZES
              }
              className="block h-full w-full object-contain"
            />
          )}
        </div>
      )}
      {/* Captions are optional — no label, no figcaption. Audio carries its
          label inside the card, so it never doubles up with a caption. */}
      {item.label && item.type !== "audio" ? (
        <figcaption className={MEDIA_CAPTION_CLASS}>{item.label}</figcaption>
      ) : null}
    </figure>
  );
}

function MediaRow({ row }: { row: MediaRowData }) {
  return row.columns > 1 ? (
    <div
      className={`grid grid-cols-1 items-start gap-3 ${
        row.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      {row.items.map((item) => (
        <MediaFigure
          key={mediaKey(item)}
          item={item}
          columns={row.columns}
        />
      ))}
    </div>
  ) : (
    <MediaFigure item={row.items[0]} />
  );
}

// The media gallery on a project detail page: images, videos, audio, and
// embedded demos (YouTube, X posts). Visual media carries intrinsic
// dimensions so the aspect ratio is set up front and nothing reflows as
// assets load; audio renders as its own card; embeds bring their own chrome
// (tweets via the client-side TweetEmbed, since widgets.js only runs in
// the browser). Demos and tweets sit two to a row; everything else is
// full-width. Items sit at the same fixed 12px gutter (gap-3) the
// projects index grid uses between cards.
export function ProjectMedia({ project }: { project: Project }) {
  const rows = mediaRows(project.media ?? []);

  return (
    // No rule, no extra break: media flows on from the body like figures
    // in a blog post. mt-6 continues the body's 24px rhythm rather than
    // opening a bigger break.
    <div className="mt-6 flex flex-col gap-3">
      {rows.map((row) => (
        <MediaRow key={row.items.map(mediaKey).join("|")} row={row} />
      ))}
    </div>
  );
}
