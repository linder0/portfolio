import type { Metadata } from "next";
import { PageMain } from "@/components/page-main";
import { AnnotatedText } from "@/components/annotated-text";
import { MEDIA_CAPTION_CLASS } from "@/components/media-caption";
import { getStoredNotes } from "@/lib/note-store";
import { ClipPreview } from "./clip-preview";
import { MasonryGrid } from "./masonry-grid";

export const metadata: Metadata = {
  title: "Playground · Linda Xue",
  description: "Experiments, embeds, and things in progress.",
};

type Embed = {
  title: string;
  src: string;
  aspect?: string;
};

// Drop new experiments in here — each becomes an embedded frame below.
const embeds: Embed[] = [];

type Clip = {
  src: string;
  pairedSrc?: string;
  fullResolution?: boolean;
  width: number;
  height: number;
  date: string;
  label: string;
  href?: string;
};

// Short self-hosted demo clips, shown GIF-style in a compact grid. `href`
// links the caption out to the original post or demo when available.
// Dimensions reserve space at the video's native aspect ratio before loading.
// Use the original publish date, or the source video's creation date for uploads.
const clips = ([
  {
    src: "/videos/playground/patrick-sailboxes.mp4",
    fullResolution: true,
    width: 480,
    height: 360,
    date: "2026-11-06",
    label: "Geeked Patrick render",
    href: "https://x.com/lindaxue/status/2118755037627511137",
  },
  {
    src: "/videos/playground/monsterse-weekend.mp4",
    fullResolution: true,
    width: 648,
    height: 360,
    date: "2026-10-26",
    label: "Monsters after a weekend of training",
    href: "https://x.com/lindaxue/status/2114777893717115211",
  },
  {
    src: "/videos/playground/monsterse-training.mp4",
    fullResolution: true,
    width: 648,
    height: 360,
    date: "2026-10-22",
    label: "Monsters learning to walk and find food",
    href: "https://x.com/lindaxue/status/2113324136827380042",
  },
  {
    src: "/videos/playground/sail-bart-campaign.mp4",
    fullResolution: true,
    width: 1280,
    height: 504,
    date: "2026-10-01",
    label: "Sail Research BART campaign",
  },
  {
    src: "/videos/playground/nautical-flags.mp4",
    pairedSrc: "/videos/playground/nautical-flags-2.mp4",
    fullResolution: true,
    width: 480,
    height: 800,
    date: "2026-10-01",
    label: "Nautical flag shifting field",
    href: "https://x.com/lindaxue/status/2105476568634331605",
  },
  {
    src: "/videos/playground/gemini-clone.mp4",
    width: 1280,
    height: 826,
    date: "2025-12-08",
    label: "Gemini clone",
    href: "https://geminiclone-blue-sigma.vercel.app",
  },
  {
    src: "/videos/playground/il-tabletop-arm.mp4",
    width: 1280,
    height: 720,
    date: "2026-08-02",
    label: "IL tabletop arm",
    href: "https://x.com/lindaxue/status/2083944275986075880",
  },
  {
    src: "/videos/playground/yam-arm-harness.mp4",
    width: 1366,
    height: 720,
    date: "2026-07-27",
    label: "YAM arm harness (MuJoCo + three.js)",
    href: "https://x.com/lindaxue/status/2081766309990109505",
  },
  {
    src: "/videos/playground/rl-ant-demo.mp4",
    width: 1254,
    height: 720,
    date: "2026-07-15",
    label: "RL ant (MuJoCo + PPO)",
    href: "https://x.com/lindaxue/status/2077415138831843678",
  },
] satisfies Clip[]).toSorted((a, b) => b.date.localeCompare(a.date));

export default async function PlaygroundPage() {
  const stored = await getStoredNotes();

  return (
    <PageMain fullWidth>
      {clips.length ? (
        <MasonryGrid>
          {clips.map((clip) => (
            <div key={clip.src} className="min-w-0">
              <ClipPreview
                sources={clip.pairedSrc ? [clip.src, clip.pairedSrc] : [clip.src]}
                label={clip.label}
                href={clip.href}
                width={clip.width}
                height={clip.height}
                fullResolution={clip.fullResolution}
              />
              {clip.href ? (
                <a
                  href={clip.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${MEDIA_CAPTION_CLASS} link-glow block w-fit`}
                >
                  {clip.label} ↗
                </a>
              ) : (
                <p className={MEDIA_CAPTION_CLASS}>{clip.label}</p>
              )}
            </div>
          ))}
        </MasonryGrid>
      ) : null}

      {embeds.length ? (
        <div
          className={
            clips.length
              ? "mt-12 content-grid gap-y-8 [--card-span:12] sm:[--card-span:6]"
              : "content-grid gap-y-8 [--card-span:12] sm:[--card-span:6]"
          }
        >
          {embeds.map((embed) => (
            <figure key={embed.title} className="min-w-0">
              <div
                className="w-full overflow-hidden border border-border"
                style={{ aspectRatio: embed.aspect ?? "4 / 3" }}
              >
                <iframe
                  src={embed.src}
                  title={embed.title}
                  loading="lazy"
                  className="h-full w-full"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                />
              </div>
              <figcaption className={MEDIA_CAPTION_CLASS}>
                {embed.title}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {!embeds.length && !clips.length ? (
        <p className="copy-16">
          <AnnotatedText
            text="Nothing yet."
            stored={stored}
          />
        </p>
      ) : null}
    </PageMain>
  );
}
