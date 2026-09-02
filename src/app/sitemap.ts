import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/project-store";
import { getAllPosts } from "@/lib/post-store";

const ROOT = "https://lindaxue.com";
const PROJECTS = "https://projects.lindaxue.com";
const WRITING = "https://writing.lindaxue.com";
const PLAYGROUND = "https://playground.lindaxue.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getAllProjects(),
    getAllPosts(),
  ]);

  return [
    { url: ROOT, changeFrequency: "monthly", priority: 1 },
    { url: PROJECTS, changeFrequency: "monthly", priority: 0.9 },
    { url: WRITING, changeFrequency: "weekly", priority: 0.9 },
    { url: PLAYGROUND, changeFrequency: "monthly", priority: 0.7 },
    ...projects
      .filter((project) => !project.draft)
      .map((project) => ({
        url: `${PROJECTS}/${project.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...posts
      .filter((post) => !post.draft)
      .map((post) => ({
        url: `${WRITING}/${post.slug}`,
        lastModified: post.date,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
