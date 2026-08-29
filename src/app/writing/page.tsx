import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAllPosts } from "@/lib/post-store";
import { formatPostDate } from "@/lib/writing";
import { sectionBase } from "@/lib/domains";
import { PageMain } from "@/components/page-main";
import { AnnotatedText } from "@/components/annotated-text";
import { IndexRow } from "@/components/index-row";
import { NewPostButton } from "@/components/new-post-button";
import { getStoredNotes } from "@/lib/note-store";
import { mergeNote, postToNote } from "@/lib/notes";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Writing — Linda Xue",
  description: "Notes and writing by Linda Xue.",
};

export default async function WritingPage() {
  const host = (await headers()).get("host") ?? "";
  const base = sectionBase(host, "writing");
  const stored = await getStoredNotes();
  const canEdit = await isAuthenticated();
  // Drafts only appear for the signed-in owner.
  const posts = (await getAllPosts()).filter((post) => !post.draft || canEdit);

  return (
    <PageMain>
      <ol className="[&>li:first-child>a]:pt-0">
        {posts.map((post) => {
          const note = postToNote(post);
          return (
            <IndexRow
              key={post.id}
              href={`${base}/${post.slug}`}
              note={mergeNote(note, stored[note.id])}
              title={<AnnotatedText text={post.title} stored={stored} />}
              tagline={<AnnotatedText text={post.tagline} stored={stored} />}
              badge={post.draft ? "draft" : undefined}
              thumbnail={post.thumbnail}
              thumbnailKind="photo"
              right={formatPostDate(post)}
            />
          );
        })}
      </ol>

      <div className="mt-8">
        <NewPostButton base={base} />
      </div>
    </PageMain>
  );
}
