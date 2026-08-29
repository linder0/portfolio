import type { Metadata } from "next";
import { headers } from "next/headers";
import { PageMain } from "@/components/page-main";
import { AnnotatedText } from "@/components/annotated-text";
import { ProjectCard } from "@/components/project-card";
import { getStoredNotes } from "@/lib/note-store";
import { getAllProjects } from "@/lib/project-store";
import { sectionBase } from "@/lib/domains";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  openGraph: {
    siteName: "Linda Xue",
    images: [
      {
        url: "/images/site/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Linda in orange-tinted glasses with a glass of wine",
      },
    ],
  },
};

export default async function Page() {
  const host = (await headers()).get("host") ?? "";
  const base = sectionBase(host, "projects");
  const stored = await getStoredNotes();
  const canEdit = await isAuthenticated();

  // Newest first, drafts only for the signed-in owner (same ordering as the
  // /projects index).
  const projects = (await getAllProjects())
    .filter((project) => !project.draft || canEdit)
    .sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <PageMain>
      {/* The bio hero is hidden for now — home opens straight on the
          projects grid (same cards as /projects). */}
      <ol className="grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
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
