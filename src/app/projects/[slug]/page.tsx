import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects, type Project } from "@/lib/projects";
import { postBlocks } from "@/lib/writing";
import { BodyBlocks } from "@/components/body-blocks";
import { mergeNote, projectLinkToNote } from "@/lib/notes";
import { getStoredNotes, type StoredNotes } from "@/lib/note-store";
import { NoteLink } from "@/components/note-link";
import { AnnotatedText } from "@/components/annotated-text";
import { PageMain } from "@/components/page-main";
import { ProjectMedia } from "@/components/project-media";
import { CreditsTable, type CreditRow } from "@/components/credits-table";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
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

function projectCredits(
  project: Project,
  stored: StoredNotes,
): CreditRow[] {
  // Grid values run through AnnotatedText so stored highlights render (and so
  // selecting a value + "m" can pin a note to it).
  const annotate = (text: string) => (
    <AnnotatedText text={text} stored={stored} />
  );

  // Hangful shows only the essentials.
  if (project.slug === "hangful") {
    return [
      { label: "Year", value: annotate(project.year) },
      { label: "Stack", value: annotate(project.tools.join(" · ")) },
    ];
  }

  const rows: (CreditRow | false | undefined)[] = [
    { label: "Role", value: annotate(project.role) },
    { label: "Year", value: annotate(project.year) },
    project.client
      ? { label: "For", value: annotate(project.client) }
      : undefined,
    project.duration
      ? { label: "Duration", value: annotate(project.duration) }
      : undefined,
    Boolean(project.collaborators?.length) && {
      label: "With",
      value: annotate(project.collaborators!.join(" · ")),
    },
    { label: "Stack", value: annotate(project.tools.join(" · ")) },
  ];
  return rows.filter(Boolean) as CreditRow[];
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const stored = await getStoredNotes();

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
        <p className="copy-20 mt-5 max-w-measure">
          <AnnotatedText text={project.tagline} stored={stored} />
        </p>
      </header>

      <CreditsTable rows={projectCredits(project, stored)} className="mt-12" />

      <div className="mt-12 max-w-measure">
        <p className="copy-18">
          <AnnotatedText text={project.description} stored={stored} />
        </p>
      </div>

      {project.body && (
        // The long-form case study — same block format as writing posts.
        <div className="mt-12 max-w-measure">
          <BodyBlocks blocks={postBlocks(project.body)} stored={stored} />
        </div>
      )}

      {project.media?.length ? (
        <div className="max-w-measure">
          <ProjectMedia media={project.media} />
        </div>
      ) : null}
    </PageMain>
  );
}
