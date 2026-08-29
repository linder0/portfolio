import type { Project } from "@/lib/projects";

/* ---------------------------------------------------------------------------
   The inline project editor's working shape + pure helpers (client-safe).
   ------------------------------------------------------------------------- */

// Every editable field, always present (empty string = cleared). The
// `updateProject` action validates and stores it.
export type ProjectDraft = {
  slug: string;
  title: string;
  year: string;
  tagline: string;
  thumbnail: string;
  description: string;
  body: string;
  // Gallery spacing in px; undefined = the 24px default (never stored).
  mediaGap?: number;
  // false = published (visible to everyone), true = only the owner sees it.
  draft: boolean;
};

export function projectDraftFrom(project: Project): ProjectDraft {
  return {
    slug: project.slug,
    title: project.title,
    year: project.year,
    tagline: project.tagline,
    thumbnail: project.thumbnail ?? "",
    description: project.description,
    body: project.body ?? "",
    mediaGap: project.mediaGap,
    draft: project.draft ?? false,
  };
}

export function projectId(project: Project): string {
  return project.id ?? project.slug;
}
