"use client";

import { useEffect, useState } from "react";

/* ---------------------------------------------------------------------------
   HeaderBar — the sticky, chrome-less header. No fill and no rule ever: the
   tag and the nav links float over whatever scrolls beneath them, picking up
   a dark drop-shadow once the page has scrolled so they stay legible. The
   header itself ignores the pointer (content scrolling through the empty
   middle stays clickable); the tag and links opt back in.
   ------------------------------------------------------------------------- */

const shadow =
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]";

export function HeaderBar({
  homeHref,
  items,
}: {
  homeHref: string;
  items: { label: string; href: string }[];
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none sticky top-0 z-50 flex items-start justify-between px-4 pt-4 lg:px-6 lg:pt-6">
      <a
        href={homeHref}
        aria-label="Linda Xue — home"
        title="Home"
        className={`shape-glow-trigger pointer-events-auto -mt-2 -ml-1 inline-block transition-[filter,transform] duration-200 ease-out hover:scale-105 lg:-mt-4 lg:-ml-2 ${
          scrolled ? shadow : ""
        }`}
      >
        <span
          role="img"
          aria-hidden="true"
          className="shape-glow block h-16 w-16 select-none bg-foreground lg:h-24 lg:w-24"
          style={{
            WebkitMaskImage: "url(/tag.png)",
            maskImage: "url(/tag.png)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "left center",
            maskPosition: "left center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </a>

      <nav
        aria-label="Primary"
        className={`pointer-events-auto flex items-center gap-5 pt-1 transition-[filter] duration-200 lg:gap-8 ${
          scrolled ? shadow : ""
        }`}
      >
        {items.map((item) => (
          <a key={item.href} href={item.href} className="label-14 link-glow">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
