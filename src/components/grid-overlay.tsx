"use client";

import { useEffect, useState } from "react";

/* Press "g" to show the same centered 13-column grid used by the shell:
   one rail column, twelve content columns, and equal outer margins.
   Collections draw their nested guides in CSS while this retains the rail. */

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
    <div
      aria-hidden
      data-grid-overlay
      className="pointer-events-none fixed inset-0 z-[200] hidden lg:block"
    >
      <div
        className="page-grid-guide absolute inset-y-0 inset-x-frame grid gap-x-gutter"
        style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
      >
        {Array.from({ length: 13 }, (_, index) => (
          <div key={index} style={{ background: "rgba(214, 82, 120, 0.14)" }} />
        ))}
      </div>
    </div>
  );
}
