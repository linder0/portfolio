import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPostDate, postBlocks, posts } from "@/lib/writing";
import { getPostBySlug } from "@/lib/post-store";
import { getStoredNotes } from "@/lib/note-store";
import { isAuthenticated } from "@/lib/auth";
import Image from "next/image";
import { AnnotatedText, RichText } from "@/components/annotated-text";
import { PageMain } from "@/components/page-main";
import { PostBody } from "@/components/post-body";
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

  const stored = await getStoredNotes();
  const blocks = postBlocks(post.body);

  return (
    <PageMain>
      <header>
        <p className="label-eyebrow">
          {formatPostDate(post)}
          {post.draft && " · draft"}
        </p>
        <h1 className="heading-48 mt-4">{post.title}</h1>
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
            className="mt-8 aspect-[3/1] w-full max-w-[38rem] border border-border object-cover"
            style={{ objectPosition: `50% ${post.thumbnailY ?? 50}%` }}
          />
        ) : (
          <Image
            src={post.thumbnail}
            alt=""
            width={1216}
            height={405}
            sizes="(min-width: 640px) 608px, 100vw"
            className="mt-8 aspect-[3/1] w-full max-w-[38rem] border border-border object-cover"
            style={{ objectPosition: `50% ${post.thumbnailY ?? 50}%` }}
          />
        ))}

      <div className="mt-12 max-w-[38rem]">
        <PostBody post={post}>
          <div className="space-y-6">
            {blocks.map((block, i) =>
              block.kind === "image" ? (
                <PostImage
                  key={i}
                  post={post}
                  index={i}
                  src={block.src}
                  width={block.width}
                  caption={
                    block.caption && (
                      <RichText text={block.caption} stored={stored} />
                    )
                  }
                />
              ) : block.kind === "heading" ? (
                // Extra air above a section heading: 24px from space-y-6
                // plus 24px here = the 48px "intro → content" step.
                <h2
                  key={i}
                  data-post-block
                  className="heading-24 [&:not(:first-child)]:pt-6"
                >
                  <AnnotatedText text={block.text} stored={stored} />
                </h2>
              ) : (
                <p key={i} data-post-block className="copy-18">
                  <RichText text={block.text} stored={stored} />
                </p>
              ),
            )}
          </div>
        </PostBody>
      </div>
    </PageMain>
  );
}
