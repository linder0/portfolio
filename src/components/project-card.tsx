import Link from "next/link";
import Image from "next/image";
import { RawImage } from "@/components/raw-image";
import { ThemedMark } from "@/components/themed-mark";
import type { Project } from "@/lib/projects";

/* ---------------------------------------------------------------------------
   ProjectCard — the card variant of the projects index: a cover image in the
   raised background-200 well, with title / tagline / year stacked underneath
   (same type voice as IndexRow, re-stacked). The cover is authored, never
   borrowed from the project page: coverMark, else cover, else the thumbnail.
   ------------------------------------------------------------------------- */

type Cover =
  | { kind: "photo"; src: string }
  | {
      kind: "mark";
      src: string;
      darkSrc?: string;
      knockout: boolean;
      // Authored logos (coverMark) display larger than derived thumbnails.
      large?: boolean;
    };

function projectCover(project: Project): Cover | undefined {
  // Card and page are independent. Never read `media` / body here — a
  // screenshot on the project page is not the index cover.
  if (project.coverMark)
    return {
      kind: "mark",
      src: project.coverMark,
      knockout: project.coverMarkKnockout ?? false,
      large: true,
    };
  if (project.cover) return { kind: "photo", src: project.cover };
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
  eager = false,
}: {
  href: string;
  project: Project;
  // Pre-annotated from the server (AnnotatedText), like IndexRow.
  title: React.ReactNode;
  tagline: React.ReactNode;
  badge?: string;
  right: string;
  eager?: boolean;
}) {
  const cover = projectCover(project);

  return (
    <li>
      <Link href={href} className="link-glow block">
        <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-background-200">
          {cover?.kind === "photo" && (
            <CoverImage
              src={cover.src}
              position={project.coverPosition}
              eager={eager}
            />
          )}
          {cover?.kind === "mark" && (
            <span className="absolute inset-0 flex items-center justify-center">
              <ThemedMark
                src={cover.src}
                darkSrc={cover.darkSrc}
                knockout={cover.knockout}
                className={cover.large ? "h-24 w-24" : "h-14 w-14"}
              />
            </span>
          )}
        </span>

        <span className="mt-2 block">
          <span className="grid grid-cols-[1fr_auto] items-baseline gap-x-6">
            <span className="heading-24 min-w-0">
              {title}
              {badge && (
                <span className="mono-13 ml-3 border border-border px-1.5 py-0.5 align-middle">
                  {badge}
                </span>
              )}
            </span>
            <span className="mono-13 self-start pt-1 text-right tabular-nums">
              {right}
            </span>
          </span>
          {tagline ? <span className="copy-14 block">{tagline}</span> : null}
        </span>
      </Link>
    </li>
  );
}

function CoverImage({
  src,
  position,
  eager,
}: {
  src: string;
  position?: "center" | "bottom";
  eager: boolean;
}) {
  // Owner uploads stream from the private Blob store, which the image
  // optimizer can't reach; local assets get resized/converted.
  const className = `absolute inset-0 h-full w-full object-cover ${
    position === "bottom" ? "object-bottom" : ""
  }`;
  if (src.startsWith("/api/")) {
    return (
      <RawImage
        src={src}
        loading={eager ? "eager" : "lazy"}
        className={className}
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      loading={eager ? "eager" : "lazy"}
      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
      className={className}
    />
  );
}
