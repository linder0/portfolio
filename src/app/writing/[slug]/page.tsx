import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  formatPostDate,
  postBlocks,
  posts,
  type Post,
  type PostBlock,
} from "@/lib/writing";
import type { StoredNote } from "@/lib/notes";
import { getPostBySlug } from "@/lib/post-store";
import { getStoredNotes } from "@/lib/note-store";
import { getPostComments } from "@/lib/comment-store";
import type { StoredComment } from "@/lib/comments";
import { isAuthenticated } from "@/lib/auth";
import Image from "next/image";
import { AnnotatedText, RichText } from "@/components/annotated-text";
import { PageMain } from "@/components/page-main";
import { PostBody } from "@/components/post-body";
import { CommentCapture } from "@/components/comment-capture";
import { PostImage } from "@/components/post-image";
import { RawImage } from "@/components/raw-image";

// Posts created or renamed inline resolve dynamically; this just prebuilds
// the static defaults.
export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || (post.draft && !(await isAuthenticated()))) {
    return { title: "Post not found — Linda Xue" };
  }

  return {
    title: `${post.title} — Linda Xue`,
    description: post.tagline,
    ...(post.thumbnail && {
      openGraph: { images: [post.thumbnail] },
    }),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // A draft is a 404 for everyone but the signed-in owner.
  if (!post || (post.draft && !(await isAuthenticated()))) {
    notFound();
  }

  // TODO: visitor commenting is built but not shipped yet. Flip COMMENTS_ENABLED
  // on to surface the in-text comment toolbar and margin threads (touches
  // CommentCapture, lib/comments, getPostComments, addComment/deleteComment).
  const COMMENTS_ENABLED: boolean = false;

  const [stored, comments] = await Promise.all([
    getStoredNotes(),
    COMMENTS_ENABLED
      ? getPostComments(post.id)
      : Promise.resolve<Record<string, StoredComment>>({}),
  ]);
  const blocks = postBlocks(post.body);

  const renderedBody = (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          index={i}
          post={post}
          stored={stored}
          comments={comments}
        />
      ))}
    </div>
  );

  return (
    <PageMain>
      <header className="max-w-measure">
        <p className="label-eyebrow">
          {formatPostDate(post)}
          {post.draft && " · draft"}
        </p>
        <h1 className="heading-48 mt-4">{post.title}</h1>
        {post.tagline && (
          <p className="copy-20 mt-5">
            <AnnotatedText
              text={post.tagline}
              stored={stored}
              comments={comments}
            />
          </p>
        )}
      </header>

      {post.thumbnail &&
        // Owner uploads stream from the private Blob store, which the image
        // optimizer can't reach; local assets get resized/converted. The
        // banner crops to 3:1 via CSS either way, so the intrinsic dimensions
        // only size the responsive variants.
        (post.thumbnail.startsWith("/api/") ? (
          <RawImage
            src={post.thumbnail}
            loading="eager"
            className="mt-8 aspect-[3/1] w-full max-w-measure object-cover"
            style={{ objectPosition: `50% ${post.thumbnailY ?? 50}%` }}
          />
        ) : (
          <Image
            src={post.thumbnail}
            alt=""
            width={1216}
            height={405}
            sizes="(min-width: 640px) 600px, 100vw"
            className="mt-8 aspect-[3/1] w-full max-w-measure object-cover"
            style={{ objectPosition: `50% ${post.thumbnailY ?? 50}%` }}
          />
        ))}

      <div className="mt-12 max-w-measure">
        <PostBody post={post}>
          {COMMENTS_ENABLED ? (
            <CommentCapture postId={post.id}>{renderedBody}</CommentCapture>
          ) : (
            renderedBody
          )}
        </PostBody>
      </div>
    </PageMain>
  );
}

// One parsed body block. Every top-level element carries data-post-block so
// the owner's drag-to-insert-image indicator can measure the gaps between
// blocks (see PostBody).
function Block({
  block,
  index,
  post,
  stored,
  comments,
}: {
  block: PostBlock;
  index: number;
  post: Post;
  stored: Record<string, StoredNote>;
  comments: Record<string, StoredComment>;
}) {
  switch (block.kind) {
    case "image":
      return (
        <PostImage
          post={post}
          index={index}
          src={block.src}
          width={block.width}
          caption={
            block.caption && (
              <RichText
                text={block.caption}
                stored={stored}
                comments={comments}
              />
            )
          }
        />
      );
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
