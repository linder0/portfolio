import type { PostBlock } from "@/lib/writing";
import type { StoredNote } from "@/lib/notes";
import type { StoredComment } from "@/lib/comments";
import { AnnotatedText, RichText } from "@/components/annotated-text";
import { RawImage } from "@/components/raw-image";

/* ---------------------------------------------------------------------------
   BodyBlocks — the one renderer for parsed long-form bodies (writing posts
   and project case studies share the same plain-text block format, see
   `lib/writing`). Every top-level element carries data-post-block so the
   post owner's drag-to-insert-image indicator can measure the gaps between
   blocks (see PostBody); the attribute is inert on project pages.

   Image blocks are pluggable: the writing page swaps in PostImage (owner
   resize/reorder handles), everywhere else gets the plain figure below.
   ------------------------------------------------------------------------- */

type ImageBlock = Extract<PostBlock, { kind: "image" }>;

export function BodyBlocks({
  blocks,
  stored,
  comments,
  renderImage,
}: {
  blocks: PostBlock[];
  stored: Record<string, StoredNote>;
  comments?: Record<string, StoredComment>;
  // Custom image renderer; receives the block, its paragraph index, and the
  // caption already rendered through the rich-text pipeline.
  renderImage?: (
    block: ImageBlock,
    index: number,
    caption: React.ReactNode,
  ) => React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          index={i}
          stored={stored}
          comments={comments}
          renderImage={renderImage}
        />
      ))}
    </div>
  );
}

function Block({
  block,
  index,
  stored,
  comments,
  renderImage,
}: {
  block: PostBlock;
  index: number;
  stored: Record<string, StoredNote>;
  comments?: Record<string, StoredComment>;
  renderImage?: (
    block: ImageBlock,
    index: number,
    caption: React.ReactNode,
  ) => React.ReactNode;
}) {
  const caption = (text?: string) =>
    text && <RichText text={text} stored={stored} comments={comments} />;

  switch (block.kind) {
    case "image": {
      const captionNode = caption(block.caption);
      if (renderImage) return renderImage(block, index, captionNode);
      return (
        <figure data-post-block>
          <RawImage
            src={block.src}
            className="block h-auto max-w-full"
            style={block.width ? { width: block.width } : undefined}
          />
          {captionNode && (
            <figcaption className="copy-14 mt-2 opacity-60">
              {captionNode}
            </figcaption>
          )}
        </figure>
      );
    }
    case "video": {
      const captionNode = caption(block.caption);
      return (
        <figure data-post-block>
          {/* GIF-style clip: plays silently on a loop, no chrome. */}
          <video
            src={block.src}
            autoPlay
            muted
            loop
            playsInline
            className="block h-auto max-w-full"
          />
          {captionNode && (
            <figcaption className="copy-14 mt-2 opacity-60">
              {captionNode}
            </figcaption>
          )}
        </figure>
      );
    }
    case "heading":
      // Extra air above a section heading: 24px from space-y-6 plus 24px
      // here = the 48px "intro → content" step.
      return block.level === 2 ? (
        <h2 data-post-block className="heading-24 [&:not(:first-child)]:pt-6">
          <AnnotatedText text={block.text} stored={stored} comments={comments} />
        </h2>
      ) : (
        // Subheadings match the site's existing convention of bold body-size
        // paragraphs (the design's two title styles stay reserved for the
        // page title and section headings).
        <h3 data-post-block className="copy-18 font-bold">
          <AnnotatedText text={block.text} stored={stored} comments={comments} />
        </h3>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          data-post-block
          {...(block.ordered && block.start !== 1 && { start: block.start })}
          className={`copy-18 space-y-2 pl-6 ${
            block.ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} stored={stored} comments={comments} />
            </li>
          ))}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote
          data-post-block
          className="whitespace-pre-line border-l border-border py-1 pl-5 italic"
        >
          <RichText text={block.text} stored={stored} comments={comments} />
        </blockquote>
      );
    case "code":
      return (
        <pre
          data-post-block
          className="overflow-x-auto border border-border bg-gray-alpha-100 p-4"
        >
          <code className="font-mono text-[13px] leading-5">{block.code}</code>
        </pre>
      );
    case "rule":
      return <hr data-post-block className="border-border" />;
    default:
      return (
        <p data-post-block className="copy-18">
          <RichText text={block.text} stored={stored} comments={comments} />
        </p>
      );
  }
}
