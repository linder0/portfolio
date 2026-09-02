import type { BodyMediaPart, PostBlock } from "@/lib/writing";
import type { StoredNote } from "@/lib/notes";
import type { StoredComment } from "@/lib/comments";
import { AnnotatedText, RichText } from "@/components/annotated-text";
import { RawImage } from "@/components/raw-image";
import { ThemedMark } from "@/components/themed-mark";
import { JustifiedRow } from "@/components/justified-row";
import { RowMedia } from "@/components/row-media";
import { MEDIA_CAPTION_CLASS } from "@/components/media-caption";

export { RowMedia };

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
        <figcaption className={MEDIA_CAPTION_CLASS}>{caption}</figcaption>
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
  captions,
}: {
  images: BodyMediaPart[];
  // Unused — stacked columns were a one-off; `|` rows are justified.
  columns?: BodyMediaPart[][];
  // Spacing between the items in px (default: the 24px gutter).
  gap?: number;
  captions?: React.ReactNode[];
  children?: (image: BodyMediaPart, i: number) => React.ReactNode;
}) {
  // Authored pixel widths (owner resize) keep their explicit sizes.
  // Otherwise the row is justified: shared height, aspect-weighted widths,
  // filling the measure (see JustifiedRow).
  if (images.some((image) => image.width)) {
    return (
      <div
        className="flex max-w-full flex-nowrap items-start"
        style={{ columnGap: gap ?? 24 }}
      >
        {images.map((image, i) => (
          <div
            key={image.src}
            className="min-w-0"
            style={image.width ? { width: image.width } : undefined}
          >
            <RowMedia
              src={image.src}
              className="h-auto max-w-full rounded-xl"
            />
            {captions?.[i] && (
              <div className={MEDIA_CAPTION_CLASS}>{captions[i]}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <JustifiedRow items={images} gap={gap ?? 24} captions={captions} />
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
    captions?: React.ReactNode[],
  ) => React.ReactNode;
}) {
  return (
    // Consecutive media figures sit 12px apart (the fixed media gutter,
    // matching the gallery and paired rows) instead of the 24px prose step —
    // both margins are overridden so it holds whichever side space-y uses.
    <div className="space-y-6 [&>h2+*]:mt-3! [&>figure:has(+figure)]:mb-3! [&>figure+figure]:mt-3!">
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
    captions?: React.ReactNode[],
  ) => React.ReactNode;
}) {
  const caption = (text?: string, key?: React.Key) =>
    text && (
      <RichText
        key={key}
        text={text}
        stored={stored}
        comments={comments}
      />
    );

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
            <figcaption className={MEDIA_CAPTION_CLASS}>
              {captionNode}
            </figcaption>
          )}
        </figure>
      );
    }
    case "image-row": {
      const captionNode = caption(block.caption);
      const captionNodes = block.captions?.map((text, i) => caption(text, i));
      if (renderImageRow) {
        return renderImageRow(block, index, captionNode, captionNodes);
      }
      return (
        <figure data-post-block>
          <ImageRow
            images={block.images}
            columns={block.columns}
            gap={block.gap}
            captions={captionNodes}
          />
          {captionNode && (
            <figcaption className={MEDIA_CAPTION_CLASS}>
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
          {/* GIF-style clip: plays silently on a loop. Same card radius as
              body images; an authored width ("420" px or "50%" of the pane)
              sizes it, otherwise it runs its natural width. */}
          <video
            src={block.src}
            autoPlay
            muted
            loop
            playsInline
            className="block h-auto max-w-full rounded-xl"
            style={
              block.widthPct
                ? { width: `${block.widthPct}%` }
                : block.width
                  ? { width: block.width }
                  : undefined
            }
          />
          {captionNode && (
            <figcaption className={MEDIA_CAPTION_CLASS}>
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
