import Image from "next/image";
import type { ProjectMedia as Media } from "@/lib/projects";

// The media column is capped at max-w-[38rem] (608px); tell next/image so it
// never serves a wider variant than the layout can show.
const MEDIA_SIZES = "(min-width: 640px) 608px, 100vw";

// The media gallery on a project detail page: images, videos, and audio
// stacked in a single column, each with an optional caption. Visual media
// carries intrinsic dimensions so the aspect ratio is set up front and
// nothing reflows as assets load; audio is a bare player. Presentational and
// server-rendered — no client state.
export function ProjectMedia({ media }: { media: Media[] }) {
  return (
    <div className="mt-12 flex flex-col gap-12 border-t border-border pt-12">
      {media.map((item) => (
        <figure key={item.src} className="m-0">
          {item.type === "audio" ? (
            <audio
              src={item.src}
              controls
              preload="metadata"
              className="block w-full"
            />
          ) : (
            <div
              className="w-full overflow-hidden bg-background-200"
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
          {item.label ? (
            <figcaption className="label-eyebrow mt-3">{item.label}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
