import { projects as staticProjects, type Project } from "@/lib/projects";
import { recordStore } from "@/lib/record-store";

/* ---------------------------------------------------------------------------
   Project store — owner-edited projects, keyed by the static slug (stable id).

   Static projects in `lib/projects` are the seed defaults. A stored entry with
   the same id overrides individual fields (a missing field falls back to the
   default). URL slugs may be renamed inline; lookup is by the merged slug.
   Server-side only.
   ------------------------------------------------------------------------- */

export type StoredProject = {
  slug?: string;
  title?: string;
  year?: string;
  tagline?: string;
  // Empty string means "cleared" (a static default thumbnail removed).
  thumbnail?: string;
  description?: string;
  body?: string;
  // Gallery spacing in px (see Project.mediaGap).
  mediaGap?: number;
  draft?: boolean;
};
export type StoredProjects = Record<string, StoredProject>;

const store = recordStore<StoredProject>("projects");

export const getStoredProjects = store.read;
export const saveStoredProject = store.write;

function mergeProject(base: Project, stored?: StoredProject): Project {
  if (!stored) return { ...base, id: base.slug };
  return {
    ...base,
    id: base.slug,
    slug: stored.slug ?? base.slug,
    title: stored.title ?? base.title,
    year: stored.year ?? base.year,
    tagline: stored.tagline ?? base.tagline,
    thumbnail:
      stored.thumbnail !== undefined
        ? stored.thumbnail || undefined
        : base.thumbnail,
    // Mark pairing is authored in static data, not the inline editor.
    thumbnailDark: base.thumbnailDark,
    thumbnailKind: base.thumbnailKind,
    thumbnailKnockout: base.thumbnailKnockout,
    description: stored.description ?? base.description,
    body: stored.body ?? base.body,
    mediaGap: stored.mediaGap ?? base.mediaGap,
    draft: stored.draft ?? base.draft,
  };
}

// All projects, drafts included — static merged with their overrides.
// Callers hide drafts from visitors.
export async function getAllProjects(): Promise<Project[]> {
  const stored = await getStoredProjects();
  return staticProjects.map((project) =>
    mergeProject(project, stored[project.slug]),
  );
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  return (await getAllProjects()).find((project) => project.slug === slug);
}
