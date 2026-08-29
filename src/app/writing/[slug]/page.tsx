import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPostDate, postBlocks, posts } from "@/lib/writing";
import { getPostBySlug } from "@/lib/post-store";
import { getStoredNotes } from "@/lib/note-store";
import { getPostComments } from "@/lib/comment-store";
import type { StoredComment } from "@/lib/comments";
import { isAuthenticated } from "@/lib/auth";
import Image from "next/image";
import { AnnotatedText } from "@/components/annotated-text";
import { PageMain } from "@/components/page-main";
import { PostBody } from "@/components/post-body";
import { BodyBlocks } from "@/components/body-blocks";
import { CommentCapture } from "@/components/comment-capture";
import { PostImage, PostImageRow } from "@/components/post-image";
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
    <BodyBlocks
      blocks={blocks}
      stored={stored}
      comments={comments}
      // Posts swap in PostImage so the signed-in owner gets the resize
      // handles and drag-to-reorder grip; the caption arrives pre-rendered.
      renderImage={(block, index, caption) => (
        <PostImage
          key={index}
          post={post}
          index={index}
          src={block.src}
          darkSrc={block.darkSrc}
          width={block.width}
          knockout={block.knockout}
          caption={caption}
        />
      )}
      renderImageRow={(block, index, caption) => (
        <PostImageRow
          key={index}
          post={post}
          index={index}
          images={block.images}
          gap={block.gap}
          caption={caption}
        />
      )}
    />
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
          <p className="copy-20 mt-4">
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

