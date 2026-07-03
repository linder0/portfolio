"use client";

import { useNote } from "@/components/marginalia";
import type { Note } from "@/lib/notes";

export function NoteLink({
  href,
  note,
  children,
  className,
}: {
  href: string;
  note: Note;
  children: React.ReactNode;
  className?: string;
}) {
  const handlers = useNote(note);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...handlers}
      className={className}
    >
      {children}
    </a>
  );
}
