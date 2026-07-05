"use client";

import { useEffect, useRef } from "react";
import { isDarkTheme } from "@/lib/theme";

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } };
  }
}

const WIDGETS_SRC = "https://platform.twitter.com/widgets.js";

// widgets.js is shared by every embed on the page: the first mount injects
// the script, later mounts reuse it (or call load directly once it's ready).
function loadWidgets(el: HTMLElement | null) {
  if (window.twttr?.widgets) {
    window.twttr.widgets.load(el);
    return;
  }
  let script = document.querySelector<HTMLScriptElement>(
    `script[src="${WIDGETS_SRC}"]`,
  );
  if (!script) {
    script = document.createElement("script");
    script.src = WIDGETS_SRC;
    script.async = true;
    document.head.appendChild(script);
  }
  script.addEventListener("load", () => window.twttr?.widgets?.load(el));
}

// An X/Twitter post embedded via widgets.js — the demo embeds on project
// pages. The blockquote is a plain link until the script upgrades it, so
// there's a usable fallback while it loads (or if it's blocked).
export function TweetEmbed({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The theme attribute must be in place before widgets.js processes the
    // blockquote; it's read from the live <html> class, so it can't be set
    // during server render.
    ref.current
      ?.querySelector(".twitter-tweet")
      ?.setAttribute("data-theme", isDarkTheme() ? "dark" : "light");
    loadWidgets(ref.current);
  }, [id]);

  return (
    <div ref={ref}>
      <blockquote className="twitter-tweet" data-dnt="true">
        <a
          href={`https://twitter.com/i/status/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-glow"
        >
          View post on X ↗
        </a>
      </blockquote>
    </div>
  );
}
