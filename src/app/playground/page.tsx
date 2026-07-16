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
  aspect: string;
  label: string;
  href?: string;
};

// Short self-hosted demo clips, shown GIF-style in a compact grid. `href`
// links the caption out to the original post/demo.
const clips: Clip[] = [
  {
    src: "/videos/playground/rl-ant-demo.mp4",
    aspect: "1254 / 720",
    label: "RL Ant (MuJoCo + PPO)",
    href: "https://x.com/lindaxue/status/2077415138831843678",
  },
];

export default async function PlaygroundPage() {
  const stored = await getStoredNotes();

  return (
    <PageMain>
      <h1 className="heading-48">Playground</h1>

      {clips.length ? (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {clips.map((clip) => (
            <figure key={clip.src} className="m-0 min-w-0">
              <div
                className="w-full overflow-hidden bg-background-200"
                style={{ aspectRatio: clip.aspect }}
              >
                <video
                  src={clip.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="block h-full w-full object-contain"
                />
              </div>
              <figcaption className="label-eyebrow mt-3">
                {clip.href ? (
                  <a
                    href={clip.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-glow"
                  >
                    {clip.label} ↗
                  </a>
                ) : (
                  clip.label
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {embeds.length ? (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
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
              <figcaption className="mono-13 mt-3">{embed.title}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {!embeds.length && !clips.length ? (
        <p className="copy-16 mt-8">
          <AnnotatedText
            text="Nothing yet."
            stored={stored}
          />
        </p>
      ) : null}
    </PageMain>
  );
}
