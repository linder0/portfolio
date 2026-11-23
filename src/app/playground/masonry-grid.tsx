"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function MasonryGrid({ children }: { children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") return;

    const cards = Array.from(grid.children) as HTMLElement[];

    const placeCards = () => {
      const width = grid.getBoundingClientRect().width;
      if (!width) return;

      const style = getComputedStyle(grid);
      const columns =
        Number(style.getPropertyValue("--content-columns")) /
        Number(style.getPropertyValue("--card-span"));
      const columnGap = parseFloat(style.columnGap);
      const rowGap = parseFloat(style.rowGap);
      const cardWidth = (width - (columns - 1) * columnGap) / columns;

      grid.style.setProperty("--masonry-card-width", `${cardWidth}px`);
      grid.setAttribute("data-masonry-ready", "");
      const heights = cards.map((card) => card.getBoundingClientRect().height);

      // Keep DOM order and use the leftmost column when heights tie.
      const bottoms = Array.from({ length: columns }, () => 0);
      cards.forEach((card, index) => {
        const top = Math.min(...bottoms);
        const column = bottoms.indexOf(top);
        card.style.setProperty(
          "--masonry-x",
          `${column * (cardWidth + columnGap)}px`,
        );
        card.style.setProperty("--masonry-y", `${top}px`);
        bottoms[column] = top + heights[index] + rowGap;
      });

      grid.style.setProperty(
        "--masonry-height",
        `${Math.max(0, Math.max(...bottoms) - rowGap)}px`,
      );
    };

    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        placeCards();
      });
    });

    placeCards();
    observer.observe(grid);
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      grid.removeAttribute("data-masonry-ready");
    };
  }, [children]);

  return (
    <div
      ref={gridRef}
      className="content-grid gap-y-4 [--card-span:12] sm:[--card-span:6] xl:[--card-span:3]"
    >
      {children}
    </div>
  );
}
