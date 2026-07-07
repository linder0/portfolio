"use client";

import { useEffect, useState } from "react";

/* Dev-only column overlay (mounted from the root layout in development builds
   only). Press "g" to toggle it. Drawn from the live grid tokens so it always
   tracks the real layout: the left-origin columns (rose) plus the marginalia
   panel region hung from the right edge (green). The pane between them is
   fluid — it absorbs the viewport — so the right flank keeps the unit but not
   the left-origin column lines, by design. */

const FIXED_COLUMNS =
  "repeating-linear-gradient(to right, rgba(214, 82, 120, 0.14) 0, rgba(214, 82, 120, 0.14) var(--grid-col), transparent var(--grid-col), transparent calc(var(--grid-col) + var(--grid-gutter)))";
const FIXED_RIGHT_FLANK =
  "repeating-linear-gradient(to left, rgba(50, 120, 80, 0.16) 0, rgba(50, 120, 80, 0.16) var(--grid-col), transparent var(--grid-col), transparent calc(var(--grid-col) + var(--grid-gutter)))";

export function GridOverlay() {
  const [overlay, setOverlay] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== "g") return;
      // `event.target` isn't always an Element (e.g. document for synthesized
      // events), and non-elements have no `closest`.
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, [contenteditable]")
      ) {
        return;
      }
      setOverlay((v) => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!overlay) return null;

  return (
    // Above the grain (z-100) so the stripes aren't retextured.
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] hidden lg:block"
    >
      <div
        className="absolute inset-y-0 left-gutter right-0"
        style={{ background: FIXED_COLUMNS }}
      />
      <div
        className="absolute inset-y-0 right-gutter w-panel"
        style={{ background: FIXED_RIGHT_FLANK }}
      />
    </div>
  );
}
