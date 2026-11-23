"use client";

import { useState } from "react";
import { RowMedia } from "@/components/row-media";
import type { BodyMediaPart } from "@/lib/writing";
import { MEDIA_CAPTION_CLASS } from "@/components/media-caption";

/* ---------------------------------------------------------------------------
   Justified row — Flickr / Google Photos style. Items share one height;
   each width follows its intrinsic aspect ratio; the group scales so the
   widths + gap fill the row. flex-grow is the aspect (w/h).
   ------------------------------------------------------------------------- */

export function JustifiedRow({
  items,
  gap = 24,
  captions,
}: {
  items: BodyMediaPart[];
  gap?: number;
  captions?: React.ReactNode[];
}) {
  const [aspects, setAspects] = useState<Record<string, number>>({});

  return (
    <div className="flex w-full min-w-0" style={{ gap }}>
      {items.map((item, i) => {
        const aspect = aspects[item.src];
        return (
          <div
            key={item.src}
            className="min-w-0"
            style={{
              flexGrow: aspect ?? 1,
              flexShrink: 1,
              flexBasis: 0,
            }}
          >
            <RowMedia
              src={item.src}
              className="h-auto w-full rounded-xl"
              style={aspect ? { aspectRatio: String(aspect) } : undefined}
              onIntrinsicSize={(w, h) => {
                if (!w || !h) return;
                const next = w / h;
                setAspects((prev) =>
                  prev[item.src] === next ? prev : { ...prev, [item.src]: next },
                );
              }}
            />
            {captions?.[i] && (
              <div className={MEDIA_CAPTION_CLASS}>{captions[i]}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
