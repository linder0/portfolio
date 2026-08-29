import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAllProjects } from "@/lib/project-store";
import { sectionBase } from "@/lib/domains";
import { getStoredNotes } from "@/lib/note-store";
import { ProjectCard } from "@/components/project-card";
import { PageMain } from "@/components/page-main";
import { AnnotatedText } from "@/components/annotated-text";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Projects — Linda Xue",
  description: "Selected work by Linda Xue.",
};

export default async function ProjectsPage() {
  const host = (await headers()).get("host") ?? "";
  const base = sectionBase(host, "projects");
  const stored = await getStoredNotes();
  const canEdit = await isAuthenticated();
  const projects = await getAllProjects();

  // Newest first. Stable within a year, so projects sharing a year keep their
  // authored order. Drafts only appear for the signed-in owner.
  const ordered = [...projects]
    .filter((project) => !project.draft || canEdit)
    .sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <PageMain>
      {/* Cards don't feed the margin panel — the tagline sits under each
          cover instead. */}
      <ol className="grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {ordered.map((project) => (
          <ProjectCard
            key={project.slug}
            href={`${base}/${project.slug}`}
            project={project}
            title={<AnnotatedText text={project.title} stored={stored} />}
            tagline={<AnnotatedText text={project.tagline} stored={stored} />}
            badge={project.draft ? "draft" : undefined}
            right={project.year}
          />
        ))}
      </ol>
    </PageMain>
  );
}
