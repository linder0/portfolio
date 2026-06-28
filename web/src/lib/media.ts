import type { ProjectMedia } from "@/data/projects";

/** Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/,
  );
  return match ? match[1] : "";
}

/** Check if URL is a YouTube link */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube") || url.includes("youtu.be");
}

/** Resolve a thumbnail/preview image URL from a project's media object */
export function getMediaThumbnail(media?: ProjectMedia): string | null {
  if (!media) return null;
  return media.thumbnail || (media.type === "image" ? media.url : null);
}
