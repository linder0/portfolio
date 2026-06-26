/**
 * MediaHero - Unified media display component
 *
 * Renders an image or video (direct file or YouTube embed) based on media.type
 * Props: { media: { type: 'image'|'video', url, thumbnail? } }
 */

import { extractYouTubeId, isYouTubeUrl } from '../utils/media'
import { getAspectRatio } from '../data/mediaDimensions'

export default function MediaHero({ media, className = '', onImageClick }) {
  if (!media?.url) return null

  const baseClasses = `w-full rounded-lg overflow-hidden ${className}`
  const clickableClasses = onImageClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''

  if (media.type === 'video') {
    return (
      <div className={`${baseClasses} aspect-video bg-black`}>
        {isYouTubeUrl(media.url) ? (
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
  }

  return (
    <div className={`${baseClasses} ${clickableClasses}`} onClick={onImageClick}>
      <img
        src={media.url}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-auto object-contain"
        style={{ aspectRatio: getAspectRatio(media.url) }}
      />
    </div>
  )
}
