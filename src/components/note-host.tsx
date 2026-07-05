"use client";

import { useNote } from "@/components/marginalia";
import { hasContent, noteLink, type Note } from "@/lib/notes";
import { cn } from "@/lib/utils";

// Wrap any block of server-rendered content to make it feed a note into the
// margin on hover/focus. Pass the already-merged note from the server. Empty
// note shells get no handlers at all — the wrapper is inert until a stored
// note gives it content. Hosts with an actual note get the same "?" cursor as
// inline footnotes, so anything that feeds the margin shares one affordance.
// (For the owner, contentless shells still carry handlers for the "m" keybind
// but show no cursor — there's no marginalia to point at yet.)
//
// When the note contains a link, activating the host opens it — the margin
// panel isn't clickable for visitors, so the hovered element itself is how
// you follow a note's link. The host wraps arbitrary block content (which
// can hold its own anchors), so this is a click/keydown handler on a
// focusable role="link" element rather than an <a>; activations that land on
// a nested link are left to that link.
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
  const hasNote = hasContent(note);
  const href = hasNote ? noteLink(note) : null;
  const open = (e: React.SyntheticEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;
    window.open(href!, "_blank", "noopener,noreferrer");
  };
  const linkProps = href
    ? {
        role: "link",
        tabIndex: 0,
        onClick: open,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter") open(e);
        },
      }
    : undefined;
  return (
    <Tag
      {...handlers}
      {...linkProps}
      className={cn(
        className,
        hasNote && (href ? "cursor-pointer" : "cursor-help"),
      )}
    >
      {children}
    </Tag>
  );
}
