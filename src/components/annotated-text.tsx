import { Footnote } from "@/components/marginalia";
import { highlightsIn, type StoredNote } from "@/lib/notes";
import { textSegments } from "@/lib/writing";

// Renders a text block with any stored highlight annotations wrapped in
// hoverable footnote spans. Server component: the match against stored
// anchors happens at render time, so new highlights appear after save.
export function AnnotatedText({
  text,
  stored,
}: {
  text: string;
  stored: Record<string, StoredNote>;
}) {
  const highlights = highlightsIn(text, stored);
  if (!highlights.length) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const h of highlights) {
    if (h.index > cursor) parts.push(text.slice(cursor, h.index));
    parts.push(
      <Footnote key={h.id} note={h.note}>
        {h.anchor}
      </Footnote>,
    );
    cursor = h.index + h.anchor.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}

// AnnotatedText plus inline formatting: **bold**, *italic*, ***both***
// (markers stripped for visitors). Highlights anchor within a segment — an
// anchor crossing a formatting boundary won't match, which is fine for
// marginalia.
export function RichText({
  text,
  stored,
}: {
  text: string;
  stored: Record<string, StoredNote>;
}) {
  return (
    <>
      {textSegments(text).map((segment, i) => {
        let node: React.ReactNode = (
          <AnnotatedText text={segment.text} stored={stored} />
        );
        if (segment.italic) node = <em className="italic">{node}</em>;
        if (segment.bold) node = <strong className="font-bold">{node}</strong>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}
