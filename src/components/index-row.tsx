"use client";

import Link from "next/link";
import Image from "next/image";
import { useNote } from "@/components/marginalia";
import { RawImage } from "@/components/raw-image";
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
  eyebrow,
  badge,
  thumbnail,
  right,
}: {
  href: string;
  note: Note;
  // Row text comes in pre-annotated from the server (AnnotatedText), so
  // stored text highlights render inside the list too.
  title: React.ReactNode;
  tagline: React.ReactNode;
  // Small third line under the tagline (e.g. a project's categories).
  eyebrow?: string;
  // Inline marker after the title (e.g. "draft").
  badge?: string;
  thumbnail?: string;
  // The right-hand meta column.
  right: string;
}) {
  const handlers = useNote(note);

  return (
    <li className="border-border [&+li]:border-t">
      <Link
        href={href}
        {...handlers}
        className="link-glow grid grid-cols-[1fr_auto] items-baseline gap-x-8 py-6"
      >
        <span className="flex min-w-0 items-center gap-x-5">
          {thumbnail &&
            // Owner uploads stream from the private Blob store, which the
            // image optimizer can't reach; local assets get resized/converted.
            (thumbnail.startsWith("/api/") ? (
              <RawImage
                src={thumbnail}
                className="h-14 w-14 shrink-0 object-cover"
              />
            ) : (
              <Image
                src={thumbnail}
                alt=""
                width={112}
                height={112}
                className="h-14 w-14 shrink-0 object-cover"
              />
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
            {eyebrow && (
              <span className="label-eyebrow mt-3 block">{eyebrow}</span>
            )}
          </span>
        </span>

        <span className="mono-13 self-start pt-1 text-right tabular-nums">
          {right}
        </span>
      </Link>
    </li>
  );
}
