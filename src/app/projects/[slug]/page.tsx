import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";
import { getProjectBySlug } from "@/lib/project-store";
import { postBlocks } from "@/lib/writing";
import { BodyBlocks } from "@/components/body-blocks";
import { mergeNote, projectLinkToNote } from "@/lib/notes";
import { getStoredNotes } from "@/lib/note-store";
import { NoteLink } from "@/components/note-link";
import { AnnotatedText } from "@/components/annotated-text";
import { PageMain } from "@/components/page-main";
import { ProjectMedia } from "@/components/project-media";
import { ProjectBody } from "@/components/project-body";
import { ProjectImage, ProjectImageRow } from "@/components/post-image";
import { isAuthenticated } from "@/lib/auth";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || (project.draft && !(await isAuthenticated()))) {
    return { title: "Project not found — Linda Xue" };
  }

  // First visual from the media list — an image directly, or a video's
  // poster — falling back to the index-row thumbnail (a body-only project
  // may have no media gallery at all).
  const thumbnail =
    project.media
      ?.map((m) =>
        m.type === "image" ? m.src : m.type === "video" ? m.poster : undefined,
      )
      .find(Boolean) ?? project.thumbnail;

  return {
    title: `${project.title} — Linda Xue`,
    description: project.tagline,
    ...(thumbnail && {
      openGraph: { images: [thumbnail] },
    }),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // A draft is a 404 for everyone but the signed-in owner.
  if (!project || (project.draft && !(await isAuthenticated()))) {
    notFound();
  }

  const stored = await getStoredNotes();
  const blocks = project.body ? postBlocks(project.body) : [];

  return (
    <PageMain>
      <header>
        <div className="flex max-w-measure flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h1 className="heading-48">{project.title}</h1>
          {project.links.length ? (
            <nav className="flex flex-wrap justify-end gap-x-8 gap-y-3">
              {project.links.map((link) => {
                const note = projectLinkToNote(link);
                return (
                  <NoteLink
                    key={link.url}
                    href={link.url}
                    note={mergeNote(note, stored[note.id])}
                    className="mono-13 link-glow"
                  >
                    {link.label} ↗
                  </NoteLink>
                );
              })}
            </nav>
          ) : null}
        </div>
        <p className="copy-20 mt-4 max-w-measure">
          <AnnotatedText text={project.tagline} stored={stored} />
        </p>
      </header>

      <ProjectBody project={project}>
        <div className="mt-12 max-w-measure">
          <p className="copy-18">
            <AnnotatedText text={project.description} stored={stored} />
          </p>
        </div>

        {blocks.length > 0 && (
          // Blocks continue the body, so they get the within-block step (24),
          // matching the space-y-6 rhythm inside BodyBlocks.
          <div className="mt-6 max-w-measure">
            <BodyBlocks
              blocks={blocks}
              stored={stored}
              renderImage={(block, index, caption) => (
                <ProjectImage
                  key={index}
                  project={project}
                  index={index}
                  src={block.src}
                  darkSrc={block.darkSrc}
                  width={block.width}
                  knockout={block.knockout}
                  caption={caption}
                />
              )}
              renderImageRow={(block, index, caption) => (
                <ProjectImageRow
                  key={index}
                  project={project}
                  index={index}
                  images={block.images}
                  gap={block.gap}
                  caption={caption}
                />
              )}
            />
          </div>
        )}

        {/* Media lives inside ProjectBody so the owner's edit controls land
            at the very bottom of the page, below the gallery. */}
        {project.media?.length ? (
          <div className="max-w-measure">
            <ProjectMedia project={project} />
          </div>
        ) : null}
      </ProjectBody>
    </PageMain>
  );
}
