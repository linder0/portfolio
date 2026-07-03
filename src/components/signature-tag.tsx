"use client";

import { useEffect } from "react";
import { isDarkTheme, isInternalCrossHost, setTheme } from "@/lib/theme";
import { parentDomain } from "@/lib/domains";

// CSS custom properties the (now-hidden) Customize panel used to override.
const OVERRIDE_PROPS = [
  "--background-100",
  "--foreground",
  "--grain-opacity",
  "--radius",
];

// Clear any style overrides persisted from the old Customize panel. While the
// panel is hidden there's no way to reset them, and the inline values it wrote
// to <html> beat the theme CSS — which broke light/dark toggling.
function clearStyleOverrides() {
  try {
    const root = document.documentElement;
    OVERRIDE_PROPS.forEach((prop) => root.style.removeProperty(prop));
    localStorage.removeItem("style-overrides");
    const domain = parentDomain(window.location.hostname);
    const scope = "path=/;samesite=lax" + (domain ? `;domain=${domain}` : "");
    document.cookie = `style-overrides=;max-age=0;${scope}`;
  } catch {}
}

export function SignatureTag() {
  useEffect(() => {
    clearStyleOverrides();
  }, []);

  // Carry the current theme across cross-subdomain navigations. Sections live on
  // separate origins; in dev (*.localhost) a shared cookie is rejected, so we
  // append `?theme=` to cross-host links on click. (This used to live in the
  // now-hidden RightRail.)
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (!isInternalCrossHost(url) || url.searchParams.has("theme")) return;
      url.searchParams.set("theme", isDarkTheme() ? "dark" : "light");
      anchor.href = url.toString();
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme(!isDarkTheme())}
      // Absolute on mobile so it scrolls away with the page (the body is the
      // scroller there); fixed on lg where only the content pane scrolls.
      className="shape-glow-trigger absolute right-4 top-4 z-50 transition-transform duration-200 ease-out hover:scale-105 lg:fixed lg:right-6 lg:top-6"
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
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </button>
  );
}
