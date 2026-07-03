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

export default async function PlaygroundPage() {
  const stored = await getStoredNotes();

  return (
    <PageMain>
      <h1 className="heading-48">Playground</h1>

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
      ) : (
        <p className="copy-16 mt-8">
          <AnnotatedText
            text="Nothing yet."
            stored={stored}
          />
        </p>
      )}
    </PageMain>
  );
}
