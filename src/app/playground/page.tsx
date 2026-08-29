import type { Metadata } from "next";
import { PageMain } from "@/components/page-main";
import { AnnotatedText } from "@/components/annotated-text";
import { getStoredNotes } from "@/lib/note-store";

export const metadata: Metadata = {
  title: "Playground — Linda Xue",
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
  label: string;
  href?: string;
};

// Short self-hosted demo clips, shown GIF-style in a compact grid. `href`
// links the caption out to the original post/demo. Every tile is 16:9 so
// the row stays even regardless of the source file.
const clips: Clip[] = [
  {
    src: "/videos/playground/il-tabletop-arm.mp4",
    label: "IL Tabletop Arm",
    href: "https://x.com/lindaxue/status/2083944275986075880",
  },
  {
    src: "/videos/playground/yam-arm-harness.mp4",
    label: "YAM Arm Harness (MuJoCo + three.js)",
    href: "https://x.com/lindaxue/status/2081766309990109505",
  },
  {
    src: "/videos/playground/rl-ant-demo.mp4",
    label: "RL Ant (MuJoCo + PPO)",
    href: "https://x.com/lindaxue/status/2077415138831843678",
  },
];

export default async function PlaygroundPage() {
  const stored = await getStoredNotes();

  return (
    <PageMain>
      {clips.length ? (
        // Same card grid as /projects: native-aspect covers, serif title
        // underneath.
        <div className="grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          {clips.map((clip) => {
            const card = (
              <>
                {/* Native aspect ratio, bounded by the column width. */}
                <span className="block w-full overflow-hidden bg-background-200">
                  <video
                    src={clip.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="block h-auto w-full"
                  />
                </span>
                <span className="heading-24 mt-2 block">
                  {clip.label}
                  {clip.href && " ↗"}
                </span>
              </>
            );
            return clip.href ? (
              <a
                key={clip.src}
                href={clip.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-glow block min-w-0"
              >
                {card}
              </a>
            ) : (
              <div key={clip.src} className="min-w-0">
                {card}
              </div>
            );
          })}
        </div>
      ) : null}

      {embeds.length ? (
        <div
          className={
            clips.length
              ? "mt-12 grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2"
              : "grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2"
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
              <figcaption className="mono-13 mt-2">{embed.title}</figcaption>
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
