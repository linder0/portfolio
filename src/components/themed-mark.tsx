import type { CSSProperties } from "react";
import { RawImage } from "@/components/raw-image";

/* ---------------------------------------------------------------------------
   ThemedMark — a logo that sits on the page with no plate behind it.

   Light shows a dark mark, dark shows a light mark. If the asset still has a
   baked-in white or black square, `knockout` knocks that plate out with
   mix-blend so only the glyph remains (multiply on paper, screen on ink).

   Pass `darkSrc` when you have both colorways. The two files must share the
   same glyph padding — otherwise the mark jumps size when the theme
   changes. A single white-on-black asset is inverted on paper.
   Transparent/colored marks (SVGs) should set `knockout={false}`.
   ------------------------------------------------------------------------- */

export function ThemedMark({
  src,
  darkSrc,
  knockout = true,
  className,
  imgClassName,
  style,
  alt = "",
}: {
  src: string;
  darkSrc?: string;
  knockout?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  const frame = `relative inline-block ${className ?? ""}`;
  const img = imgClassName ?? "h-full w-full object-contain";

  if (!knockout) {
    return (
      <span className={frame} style={style}>
        <RawImage
          src={src}
          alt={alt}
          className={`${img} ${darkSrc ? "block dark:hidden" : "block"}`}
        />
        {darkSrc ? (
          <RawImage
            src={darkSrc}
            alt=""
            className={`${img} hidden dark:block`}
          />
        ) : null}
      </span>
    );
  }

  if (darkSrc) {
    return (
      <span className={frame} style={style}>
        <RawImage
          src={src}
          alt={alt}
          className={`${img} mark-on-paper block dark:hidden`}
        />
        <RawImage
          src={darkSrc}
          alt=""
          className={`${img} mark-on-ink hidden dark:block`}
        />
      </span>
    );
  }

  // One white-on-black plate: invert to a dark mark on paper, knock the
  // black square out on ink.
  return (
    <span className={frame} style={style}>
      <RawImage
        src={src}
        alt={alt}
        className={`${img} mark-on-paper invert block dark:hidden`}
      />
      <RawImage
        src={src}
        alt=""
        className={`${img} mark-on-ink hidden dark:block`}
      />
    </span>
  );
}
