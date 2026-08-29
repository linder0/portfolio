"use client";

import Link from "next/link";
import Image from "next/image";
import { useNote } from "@/components/marginalia";
import { RawImage } from "@/components/raw-image";
import { ThemedMark } from "@/components/themed-mark";
import type { Note } from "@/lib/notes";

// The one index-row pattern shared by every list page (projects, writing):
// title + tagline on the left, a right-aligned meta column (year, date),
// hairline rules between rows, hover = the brighter glow. Hovering the row
// feeds its note into the margin.
export function IndexRow({
  href,
  note,
  title,
  tagline,
  badge,
  thumbnail,
  thumbnailDark,
  thumbnailKind,
  thumbnailKnockout,
  right,
}: {
  href: string;
  note: Note;
  // Row text comes in pre-annotated from the server (AnnotatedText), so
  // stored text highlights render inside the list too.
  title: React.ReactNode;
  tagline: React.ReactNode;
  // Inline marker after the title (e.g. "draft").
  badge?: string;
  thumbnail?: string;
  thumbnailDark?: string;
  // "mark" = a theme-responsive logo with no plate. "photo" (the default) =
  // the small square crop — the one thumb style shared by every list page.
  thumbnailKind?: "mark" | "photo";
  thumbnailKnockout?: boolean;
  // The right-hand meta column.
  right: string;
}) {
  const handlers = useNote(note);
  const isMark = thumbnailKind === "mark";

  return (
    <li className="border-border [&+li]:border-t">
      <Link
        href={href}
        {...handlers}
        // The meta column is a real grid slot on lg — span-2 wide (fits the
        // longest date, "December 25, 2025") rather than shrink-wrapped — so
        // every row's meta starts on the same line. Gaps are the grid gutter.
        className="link-glow grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-6 lg:grid-cols-[1fr_var(--span-2)]"
      >
        <span className="flex min-w-0 items-start gap-x-3">
          {thumbnail &&
            (isMark ? (
              <ThemedMark
                src={thumbnail}
                darkSrc={thumbnailDark}
                knockout={thumbnailKnockout ?? !thumbnail.endsWith(".svg")}
                className="h-8 w-8 shrink-0"
              />
            ) : (
              <Thumbnail src={thumbnail} />
            ))}
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
        </span>

        <span className="mono-13 self-start pt-1 text-right tabular-nums">
          {right}
        </span>
      </Link>
    </li>
  );
}

function Thumbnail({ src }: { src: string }) {
  // Owner uploads stream from the private Blob store, which the image
  // optimizer can't reach; local assets get resized/converted.
  const className = "h-8 w-8 shrink-0 object-cover";
  if (src.startsWith("/api/")) {
    return <RawImage src={src} className={className} />;
  }
  return (
    <Image src={src} alt="" width={64} height={64} className={className} />
  );
}
