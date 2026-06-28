import type { ProjectMedia } from "@/data/projects";
import { extractYouTubeId, isYouTubeUrl } from "@/lib/media";
import { getAspectRatio } from "@/data/mediaDimensions";

interface MediaHeroProps {
  media?: ProjectMedia;
  className?: string;
  onImageClick?: () => void;
}

export default function MediaHero({
  media,
  className = "",
  onImageClick,
}: MediaHeroProps) {
  if (!media?.url) return null;

  const baseClasses = `w-full rounded-lg overflow-hidden ${className}`;
  const clickableClasses = onImageClick
    ? "cursor-pointer hover:opacity-90 transition-opacity"
    : "";

  if (media.type === "video") {
    return (
      <div className={`${baseClasses} aspect-video bg-black`}>
        {isYouTubeUrl(media.url) ? (
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(media.url)}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={media.url}
            poster={media.thumbnail}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${clickableClasses}`} onClick={onImageClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-auto object-contain"
        style={{ aspectRatio: getAspectRatio(media.url) }}
      />
    </div>
  );
}
