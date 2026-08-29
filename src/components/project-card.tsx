import Link from "next/link";
import Image from "next/image";
import { RawImage } from "@/components/raw-image";
import { ThemedMark } from "@/components/themed-mark";
import type { Project } from "@/lib/projects";

/* ---------------------------------------------------------------------------
   ProjectCard — the card variant of the projects index: a cover image in the
   raised background-200 well, with title / tagline / year stacked underneath
   (same type voice as IndexRow, re-stacked). The cover is derived, not
   authored: first gallery image, else a video's poster frame, else the
   project's mark centered on the well.
   ------------------------------------------------------------------------- */

type Cover =
  | { kind: "photo"; src: string }
  | { kind: "mark"; src: string; darkSrc?: string; knockout: boolean };

function projectCover(project: Project): Cover | undefined {
  for (const item of project.media ?? []) {
    if (item.type === "image") return { kind: "photo", src: item.src };
    if (item.type === "video" && item.poster)
      return { kind: "photo", src: item.poster };
  }
  if (!project.thumbnail) return undefined;
  if (project.thumbnailKind === "mark") {
    return {
      kind: "mark",
      src: project.thumbnail,
      darkSrc: project.thumbnailDark,
      knockout:
        project.thumbnailKnockout ?? !project.thumbnail.endsWith(".svg"),
    };
  }
  return { kind: "photo", src: project.thumbnail };
}

export function ProjectCard({
  href,
  project,
  title,
  tagline,
  badge,
  right,
}: {
  href: string;
  project: Project;
  // Pre-annotated from the server (AnnotatedText), like IndexRow.
  title: React.ReactNode;
  tagline: React.ReactNode;
  badge?: string;
  right: string;
}) {
  const cover = projectCover(project);

  return (
    <li>
      <Link href={href} className="link-glow block">
        <span className="relative block aspect-[4/3] w-full overflow-hidden bg-background-200">
          {cover?.kind === "photo" && <CoverImage src={cover.src} />}
          {cover?.kind === "mark" && (
            <span className="absolute inset-0 flex items-center justify-center">
              <ThemedMark
                src={cover.src}
                darkSrc={cover.darkSrc}
                knockout={cover.knockout}
                className="h-14 w-14"
              />
            </span>
          )}
        </span>

        <span className="mt-2 grid grid-cols-[1fr_auto] items-baseline gap-x-6">
          <span className="min-w-0">
            <span className="heading-24 block">
              {title}
              {badge && (
                <span className="mono-13 ml-3 border border-border px-1.5 py-0.5 align-middle">
                  {badge}
                </span>
              )}
            </span>
            <span className="copy-14 mt-1 block">{tagline}</span>
          </span>
          <span className="mono-13 self-start pt-1 text-right tabular-nums">
            {right}
          </span>
        </span>
      </Link>
    </li>
  );
}

function CoverImage({ src }: { src: string }) {
  // Owner uploads stream from the private Blob store, which the image
  // optimizer can't reach; local assets get resized/converted.
  const className = "absolute inset-0 h-full w-full object-cover";
  if (src.startsWith("/api/")) {
    return <RawImage src={src} className={className} />;
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
      className="object-cover"
    />
  );
}
