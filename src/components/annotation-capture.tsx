"use client";

import { useEffect } from "react";
import { useMargin } from "@/components/marginalia";
import { highlightId, normalizeAnchor, normalizeContext } from "@/lib/notes";

// How much text on each side of a selection is stored to pin the highlight
// to that one occurrence. Enough to be unambiguous, small enough to survive
// unrelated edits elsewhere in the paragraph.
const CONTEXT_CHARS = 32;

// The normalized text immediately before/after the selection within its
// enclosing block, so "company" here can be told apart from "company" there.
function selectionContext(range: Range): { prefix: string; suffix: string } {
  try {
    const start =
      range.startContainer instanceof Element
        ? range.startContainer
        : range.startContainer.parentElement;
    // Block-level hosts only — selecting text that is already highlighted
    // must resolve the same context as when the highlight was created, so
    // the wrapping footnote <span> can't be the boundary. Table cells count
    // as blocks so credits-grid values can be annotated too.
    const block = start?.closest(
      "p, li, h1, h2, h3, dd, dt, blockquote, td, th",
    );
    if (!block) return { prefix: "", suffix: "" };

    const before = document.createRange();
    before.setStart(block, 0);
    before.setEnd(range.startContainer, range.startOffset);
    const after = document.createRange();
    after.setStart(range.endContainer, range.endOffset);
    after.setEnd(block, block.childNodes.length);

    return {
      prefix: normalizeContext(before.toString()).slice(-CONTEXT_CHARS),
      suffix: normalizeContext(after.toString()).slice(0, CONTEXT_CHARS),
    };
  } catch {
    return { prefix: "", suffix: "" };
  }
}

// Owner-only keybind, two modes:
// - select some text and press "m" to pin a note to that phrase (saving
//   underlines it for visitors);
// - with nothing selected, hover an addressable element (a bio paragraph,
//   the photo, ...) and press "m" to edit that element's note.
export function AnnotationCapture() {
  const { canEdit, openEditor, armedNote } = useMargin();

  useEffect(() => {
    if (!canEdit) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "m" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA")
      ) {
        return;
      }

      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const anchor = normalizeAnchor(selection.toString());
        if (!anchor) return;
        event.preventDefault();
        const { prefix, suffix } = selectionContext(selection.getRangeAt(0));
        selection.removeAllRanges();
        openEditor({
          id: highlightId(anchor, prefix, suffix),
          anchor,
          prefix,
          suffix,
        });
        return;
      }

      const armed = armedNote();
      if (armed) {
        event.preventDefault();
        openEditor(armed);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [canEdit, openEditor, armedNote]);

  return null;
}
