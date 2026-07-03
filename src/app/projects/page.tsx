import type { Metadata } from "next";
import { headers } from "next/headers";
import { projects } from "@/lib/projects";
import { sectionBase } from "@/lib/domains";
import { getStoredNotes } from "@/lib/note-store";
import { mergeNote, projectToNote } from "@/lib/notes";
import { IndexRow } from "@/components/index-row";
import { PageMain } from "@/components/page-main";
import { AnnotatedText } from "@/components/annotated-text";

export const metadata: Metadata = {
  title: "Projects — Linda Xue",
  description: "Selected work by Linda Xue.",
};

export default async function ProjectsPage() {
  const host = (await headers()).get("host") ?? "";
  const base = sectionBase(host, "projects");
  const stored = await getStoredNotes();

  // Newest first. Stable within a year, so projects sharing a year keep their
  // authored order.
  const ordered = [...projects].sort(
    (a, b) => Number(b.year) - Number(a.year),
  );

  return (
    <PageMain>
      <ol className="[&>li:first-child>a]:pt-0">
        {ordered.map((project) => {
          const note = projectToNote(project);
          return (
            <IndexRow
              key={project.slug}
              href={`${base}/${project.slug}`}
              note={mergeNote(note, stored[note.id])}
              title={<AnnotatedText text={project.title} stored={stored} />}
              tagline={
                <AnnotatedText text={project.tagline} stored={stored} />
              }
              right={project.year}
            />
          );
        })}
      </ol>
    </PageMain>
  );
}
