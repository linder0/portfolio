/**
 * MediaHero - Unified media display component
 *
 * Renders image, video embed, or audio player based on media.type
 * Props: { media: { type: 'image'|'video'|'audio', url, thumbnail? } }
 */

export default function MediaHero({ media, className = '' }) {
  if (!media?.url) return null

  const baseClasses = `w-full rounded-lg overflow-hidden ${className}`

  switch (media.type) {
    case 'video':
      return (
        <div className={`${baseClasses} aspect-video bg-black`}>
          {media.url.includes('vimeo') ? (
            <iframe
              src={`https://player.vimeo.com/video/${extractVimeoId(media.url)}?title=0&byline=0&portrait=0`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : media.url.includes('youtube') || media.url.includes('youtu.be') ? (
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
              className="w-full aspect-square object-cover mb-3"
            />
          )}
          <audio
            src={media.url}
            controls
            className="w-full"
          />
        </div>
      )

    case 'image':
    default:
      return (
        <div className={baseClasses}>
          <img
            src={media.url}
            alt=""
            className="w-full aspect-video object-cover"
          />
        </div>
      )
  }
}

// Helper: Extract Vimeo video ID from URL
function extractVimeoId(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : ''
}

// Helper: Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : ''
}
