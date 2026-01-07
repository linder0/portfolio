/**
 * MediaHero - Unified media display component
 *
 * Renders image, video embed, or audio player based on media.type
 * Props: { media: { type: 'image'|'video'|'audio', url, thumbnail? } }
 */

import { extractYouTubeId, extractVimeoId, isYouTubeUrl, isVimeoUrl } from '../utils/media'

export default function MediaHero({ media, className = '', onImageClick }) {
  if (!media?.url) return null

  const baseClasses = `w-full rounded-lg overflow-hidden ${className}`
  const clickableClasses = onImageClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''

  switch (media.type) {
    case 'video':
      return (
        <div className={`${baseClasses} aspect-video bg-black`}>
          {isVimeoUrl(media.url) ? (
            <iframe
              src={`https://player.vimeo.com/video/${extractVimeoId(media.url)}?title=0&byline=0&portrait=0`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : isYouTubeUrl(media.url) ? (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(media.url)}`}
              className="w-full h-full"
              frameBorder="0"
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
      )

    case 'audio':
      return (
        <div className={baseClasses}>
          {media.thumbnail && (
            <img
              src={media.thumbnail}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full aspect-square object-cover mb-3"
            />
          )}
          <audio
            src={media.url}
            controls
            preload="metadata"
            className="w-full"
          />
        </div>
      )

    case 'image':
    default:
      return (
        <div className={`${baseClasses} ${clickableClasses}`} onClick={onImageClick}>
          <img
            src={media.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-contain"
          />
        </div>
      )
  }
}
