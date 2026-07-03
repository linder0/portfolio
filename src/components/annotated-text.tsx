import { Footnote } from "@/components/marginalia";
import { highlightsIn, type StoredNote } from "@/lib/notes";

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
