"use client";

import { useNote } from "@/components/marginalia";
import { hasContent, type Note } from "@/lib/notes";
import { cn } from "@/lib/utils";

// Wrap any block of server-rendered content to make it feed a note into the
// margin on hover/focus. Pass the already-merged note from the server. Empty
// note shells get no handlers at all — the wrapper is inert until a stored
// note gives it content. Hosts with an actual note get the same "?" cursor as
// inline footnotes, so anything that feeds the margin shares one affordance.
// (For the owner, contentless shells still carry handlers for the "m" keybind
// but show no cursor — there's no marginalia to point at yet.)
export function NoteHost({
  note,
  as: Tag = "span",
  className,
  children,
}: {
  note: Note;
  as?: "span" | "div";
  className?: string;
  children?: React.ReactNode;
}) {
  const handlers = useNote(note);
  return (
    <Tag
      {...handlers}
      className={cn(className, hasContent(note) && "cursor-help")}
    >
      {children}
    </Tag>
  );
}
