"use client";

import { useEffect, useState } from "react";

/**
 * Generic media query hook.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Check if viewport is mobile (<1024px) */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

/** Check if viewport is desktop (>=1024px) */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
