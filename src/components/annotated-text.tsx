import { Footnote } from "@/components/marginalia";
import { highlightsIn, type Note, type StoredNote } from "@/lib/notes";
import { commentGroupsIn, type StoredComment } from "@/lib/comments";
import { textSegments } from "@/lib/writing";

// Renders a text block with any stored highlight annotations — and, on post
// pages, visitor comments — wrapped in hoverable footnote spans. Server
// component: the match against stored anchors happens at render time, so new
// highlights/comments appear after save. Both kinds pin the same way. A
// comment thread on the exact phrase the owner already annotated joins that
// note (one underline, one panel showing both); otherwise, when spans
// overlap, the earlier one wins (owner notes win ties).
export function AnnotatedText({
  text,
  stored,
  comments,
}: {
  text: string;
  stored: Record<string, StoredNote>;
  comments?: Record<string, StoredComment>;
}) {
  const spans: {
    key: string;
    index: number;
    anchor: string;
    note: NonNullable<Note>;
    comment: boolean;
  }[] = [
    ...highlightsIn(text, stored).map((h) => ({
      key: h.id,
      index: h.index,
      anchor: h.anchor,
      note: h.note as NonNullable<Note>,
      comment: false,
    })),
    ...(comments ? commentGroupsIn(text, comments) : []).map((group) => ({
      key: `comments:${group.index}`,
      index: group.index,
      anchor: group.anchor,
      note: { comments: group.comments },
      comment: true,
    })),
  ].sort((a, b) => a.index - b.index || (a.comment ? 1 : -1));
  if (!spans.length) return text;

  // Fold a comment thread into an owner note pinned to the same phrase.
  const merged: typeof spans = [];
  for (const span of spans) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      span.comment &&
      !prev.comment &&
      span.index === prev.index &&
      span.anchor === prev.anchor
    ) {
      prev.note = { ...prev.note, comments: span.note.comments };
      continue;
    }
    merged.push(span);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const span of merged) {
    if (span.index < cursor) continue; // overlaps the previous span
    if (span.index > cursor) parts.push(text.slice(cursor, span.index));
    parts.push(
      <Footnote
        key={span.key}
        note={span.note}
        variant={span.comment ? "comment" : "note"}
      >
        {span.anchor}
      </Footnote>,
    );
    cursor = span.index + span.anchor.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}

// AnnotatedText plus inline formatting: **bold**, *italic*, ***both***,
// ~~strike~~, `code`, [text](url) links and bare URLs (markers stripped for
// visitors). Highlights anchor within a segment — an anchor crossing a
// formatting boundary won't match, which is fine for marginalia.
export function RichText({
  text,
  stored,
  comments,
}: {
  text: string;
  stored: Record<string, StoredNote>;
  comments?: Record<string, StoredComment>;
}) {
  return (
    <>
      {textSegments(text).map((segment, i) => {
        let node: React.ReactNode = (
          <AnnotatedText
            text={segment.text}
            stored={stored}
            comments={comments}
          />
        );
        if (segment.code) {
          node = (
            <code className="bg-gray-alpha-200 px-1 font-mono text-[0.875em]">
              {node}
            </code>
          );
        }
        if (segment.italic) node = <em className="italic">{node}</em>;
        if (segment.bold) node = <strong className="font-bold">{node}</strong>;
        if (segment.strike) node = <del className="line-through">{node}</del>;
        if (segment.href) {
          const external = /^https?:\/\//.test(segment.href);
          node = (
            <a
              href={segment.href}
              {...(external && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className="link-glow underline decoration-dotted underline-offset-4"
            >
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}
