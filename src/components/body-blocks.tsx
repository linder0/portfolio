import type { PostBlock } from "@/lib/writing";
import type { StoredNote } from "@/lib/notes";
import type { StoredComment } from "@/lib/comments";
import { AnnotatedText, RichText } from "@/components/annotated-text";
import { RawImage } from "@/components/raw-image";
import { ThemedMark } from "@/components/themed-mark";

/* ---------------------------------------------------------------------------
   BodyBlocks — the one renderer for parsed long-form bodies (writing posts
   and project case studies share the same plain-text block format, see
   `lib/writing`). Every top-level element carries data-post-block so the
   owner's drag-to-insert-image indicator can measure the gaps between
   blocks (see PostBody / ProjectBody).

   Image blocks are pluggable: the writing and project pages swap in
   PostImage / ProjectImage (owner resize/reorder handles); everywhere else
   gets the plain figure below.
   ------------------------------------------------------------------------- */

type ImageBlock = Extract<PostBlock, { kind: "image" }>;
type ImageRowBlock = Extract<PostBlock, { kind: "image-row" }>;

/* ---------------------------------------------------------------------------
   Frames — the full-pane showcase ("<url> frame", images and videos). The
   figure escapes the reading measure and fills the content pane (PageMain
   is a CSS container, so 100cqw is exactly the pane's inner width), sitting
   in the raised background-200 well with a slight radius and a small mat of
   padding — the same "framed panel" device as familyoffice.is work pages.
   The media inside carries its own, slightly tighter radius. Frames are
   never resizable; they always run the pane.
   ------------------------------------------------------------------------- */

function FrameFigure({
  caption,
  children,
}: {
  caption?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure data-post-block className="w-[100cqw] max-w-[100cqw]">
      <div className="rounded-xl bg-background-200 p-2">{children}</div>
      {caption && (
        <figcaption className="copy-14 mt-2 opacity-60">{caption}</figcaption>
      )}
    </figure>
  );
}

export function FrameImage({
  block,
  caption,
}: {
  block: ImageBlock;
  caption?: React.ReactNode;
}) {
  return (
    <FrameFigure caption={caption}>
      {/* A theme pair renders both variants; CSS shows the current one. */}
      <RawImage
        src={block.src}
        className={`h-auto w-full rounded-lg ${
          block.darkSrc ? "block dark:hidden" : "block"
        }`}
      />
      {block.darkSrc && (
        <RawImage
          src={block.darkSrc}
          className="hidden h-auto w-full rounded-lg dark:block"
        />
      )}
    </FrameFigure>
  );
}

export function ImageRow({
  images,
  gap,
  children,
}: {
  images: { src: string; width?: number }[];
  // Spacing between the images in px (default: the 24px gutter).
  gap?: number;
  // Optional per-image slot (owner resize handles). Default is a plain img.
  children?: (image: { src: string; width?: number }, i: number) => React.ReactNode;
}) {
  return (
    <div
      className="flex max-w-full flex-nowrap items-start"
      style={{ columnGap: gap ?? 24 }}
    >
      {images.map((image, i) =>
        children ? (
          children(image, i)
        ) : (
          <RawImage
            key={image.src}
            src={image.src}
            className="h-auto max-w-full rounded-xl"
            style={
              image.width
                ? { width: image.width }
                : { width: `calc(50% - ${(gap ?? 24) / 2}px)` }
            }
          />
        ),
      )}
    </div>
  );
}

export function BodyBlocks({
  blocks,
  stored,
  comments,
  renderImage,
  renderImageRow,
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
  renderImageRow?: (
    block: ImageRowBlock,
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
          renderImageRow={renderImageRow}
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
  renderImageRow,
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
  renderImageRow?: (
    block: ImageRowBlock,
    index: number,
    caption: React.ReactNode,
  ) => React.ReactNode;
}) {
  const caption = (text?: string) =>
    text && <RichText text={text} stored={stored} comments={comments} />;

  switch (block.kind) {
    case "image": {
      const captionNode = caption(block.caption);
      // Frames bypass the pluggable renderer (no resize handles — a frame
      // always fills the pane), so every page gets them for free.
      if (block.frame) return <FrameImage block={block} caption={captionNode} />;
      if (renderImage) return renderImage(block, index, captionNode);
      const style = block.width ? { width: block.width } : undefined;
      return (
        <figure data-post-block>
          {block.knockout ? (
            <ThemedMark
              src={block.src}
              darkSrc={block.darkSrc}
              imgClassName="h-auto max-w-full"
              style={style}
            />
          ) : (
            <>
              {/* A theme pair renders both variants; CSS shows the current one. */}
              <RawImage
                src={block.src}
                className={`h-auto max-w-full ${
                  block.darkSrc ? "block dark:hidden" : "block"
                }`}
                style={style}
              />
              {block.darkSrc && (
                <RawImage
                  src={block.darkSrc}
                  className="hidden h-auto max-w-full dark:block"
                  style={style}
                />
              )}
            </>
          )}
          {captionNode && (
            <figcaption className="copy-14 mt-2 opacity-60">
              {captionNode}
            </figcaption>
          )}
        </figure>
      );
    }
    case "image-row": {
      const captionNode = caption(block.caption);
      if (renderImageRow) return renderImageRow(block, index, captionNode);
      return (
        <figure data-post-block>
          <ImageRow images={block.images} gap={block.gap} />
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
      if (block.frame) {
        return (
          <FrameFigure caption={captionNode}>
            <video
              src={block.src}
              autoPlay
              muted
              loop
              playsInline
              className="block h-auto w-full rounded-lg"
            />
          </FrameFigure>
        );
      }
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
