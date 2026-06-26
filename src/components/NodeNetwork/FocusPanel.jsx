import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ease } from '../../utils/motion'
import { getCategoryColor } from '../../utils/graphLayout'
import { getAspectRatio } from '../../data/mediaDimensions'
import { useIsMobile } from '../../hooks/useMediaQuery'
import TagPill from '../TagPill'
import { ExternalLinkIcon, CloseIcon, GitHubIcon } from '../Icons'
import MediaHero from '../MediaHero'

/** Twitter/X Tweet Embed */
const TweetEmbed = ({ tweetId, label }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    // Load Twitter widget script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.head.appendChild(script)
      script.onload = () => {
        window.twttr?.widgets?.load(containerRef.current)
      }
    } else {
      window.twttr.widgets.load(containerRef.current)
    }
  }, [tweetId])

  return (
    <div className="space-y-1">
      <span className="text-xs opacity-60">{label}</span>
      <div ref={containerRef} className="rounded-lg overflow-hidden">
        <blockquote className="twitter-tweet" data-media-max-width="400" data-dnt="true">
          <a href={`https://twitter.com/i/status/${tweetId}`}>Loading tweet...</a>
        </blockquote>
      </div>
    </div>
  )
}

import { extractYouTubeId, isYouTubeUrl } from '../../utils/media'

/** Lightbox for viewing images full-screen */
const ImageLightbox = ({ src, alt, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 cursor-pointer"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-6 right-6 text-white opacity-70 hover:opacity-100 transition-opacity"
      aria-label="Close lightbox"
    >
      <CloseIcon size={24} />
    </button>
    <motion.img
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.2 }}
      src={src}
      alt={alt}
      className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
)

/**
 * FocusPanel - Minimal project detail overlay for Gallery
 *
 * Layout:
 * - Desktop (lg+): Right-side panel, slides from right
 * - Mobile (<lg): Bottom sheet, slides from bottom, 75vh height
 */

// --- Sub-components ---

/** Colored category badge - handles single or multiple categories */
const CategoryBadge = ({ category, small = false }) => {
  const categories = Array.isArray(category) ? category : [category]
  const sizeClasses = small
    ? 'px-1.5 py-0 text-[10px]'
    : 'px-2 py-0.5 text-xs'

  return (
    <div className="flex items-center gap-1.5">
      {categories.map((cat) => (
        <span
          key={cat}
          className={`${sizeClasses} rounded-full text-white uppercase tracking-wider`}
          style={{ backgroundColor: getCategoryColor(cat) }}
        >
          {cat}
        </span>
      ))}
    </div>
  )
}

/** Sticky header that appears when hero scrolls out of view */
const StickyHeader = ({ project, onClose, isMobile, visible }) => (
  <motion.div
    initial={false}
    animate={{
      y: visible ? 0 : -100,
      opacity: visible ? 1 : 0
    }}
    transition={{ duration: 0.2, ease }}
    className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-3 px-6 pt-6 sm:pt-8 md:pt-10 pb-4 backdrop-blur-md"
    style={{
      backgroundColor: 'color-mix(in srgb, var(--accent) 65%, transparent)',
      pointerEvents: visible ? 'auto' : 'none',
    }}
  >
    <div className="flex items-center gap-3 min-w-0">
      {/* Close (mobile) */}
      {isMobile && (
        <button
          onClick={onClose}
          className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
          aria-label="Close panel"
        >
          <CloseIcon size={18} />
        </button>
      )}
      {/* Title */}
      <h3 className="text-sm font-medium uppercase tracking-wider truncate">
        {project.title}
      </h3>
      {/* Category */}
      <CategoryBadge category={project.category} small />
    </div>
    {/* Year */}
    <span className="label opacity-50 shrink-0">{project.year}</span>
  </motion.div>
)

// --- Main Component ---

export default function FocusPanel({ project, onClose }) {
  const isMobile = useIsMobile()
  const [lightboxImage, setLightboxImage] = useState(null)
  const [titleVisible, setTitleVisible] = useState(true)
  const panelRef = useRef(null)
  const titleRef = useRef(null)

  // Detect when title section scrolls out of view
  useEffect(() => {
    const title = titleRef.current
    const panel = panelRef.current
    if (!title || !panel) return

    const observer = new IntersectionObserver(
      ([entry]) => setTitleVisible(entry.isIntersecting),
      { root: panel, threshold: 0, rootMargin: '-48px 0px 0px 0px' }
    )
    observer.observe(title)
    return () => observer.disconnect()
  }, [])

  // Animation variants based on viewport
  const variants = {
    initial: isMobile ? { opacity: 0 } : { opacity: 0, x: 40 },
    animate: isMobile ? { opacity: 1 } : { opacity: 1, x: 0 },
    exit: isMobile ? { opacity: 0 } : { opacity: 0, x: 40 },
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3, ease }}
      className={`absolute z-[60] ${
        isMobile
          ? 'inset-0'
          : 'top-0 right-0 w-full max-w-md h-full border-l'
      }`}
      style={{
        backgroundColor: 'var(--accent)',
        borderColor: isMobile ? undefined : 'color-mix(in srgb, var(--text) 15%, transparent)'
      }}
    >
      {/* Sticky header - appears when title scrolls out of view */}
      <StickyHeader project={project} onClose={onClose} isMobile={isMobile} visible={!titleVisible} />

      {/* Scrollable content */}
      <div ref={panelRef} className="h-full overflow-y-auto">
        {/* Header Row: Close button + Category + Year */}
      <div className={`px-6 ${isMobile ? 'pt-6' : 'pt-10'} pb-6 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={onClose}
              className="opacity-50 hover:opacity-100 transition-opacity mr-4"
              aria-label="Close panel"
            >
              <CloseIcon size={20} />
            </button>
          )}
          <CategoryBadge category={project.category} />
          {project.featured && (
            <span className="text-sm opacity-60">★</span>
          )}
        </div>
        <span className="label opacity-50">{project.year}</span>
      </div>

      {/* Hero Media */}
      {project.media && (
        <div className="px-6 mb-6">
          <MediaHero
            media={project.media}
            onImageClick={project.media.type === 'image' ? () => setLightboxImage({ url: project.media.url, label: project.title }) : undefined}
          />
        </div>
      )}

      <div className="px-6 pb-8 space-y-6">
        {/* Project Info Section - tighter spacing */}
        <div className="space-y-2">
          {/* Title */}
          <div ref={titleRef}>
            <h2 className="text-3xl font-light uppercase tracking-wider">{project.title}</h2>
          </div>

          {/* Tools */}
          {project.tools?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {project.tools.map(tool => (
                <TagPill key={tool} variant="badge">{tool}</TagPill>
              ))}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <p className="text-sm leading-relaxed opacity-80">
              {project.description}
            </p>
          )}

          {/* Links as buttons */}
          {project.links?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text) 10%, transparent)',
                  }}
                >
                  {link.type === 'github' ? <GitHubIcon size={16} /> : <ExternalLinkIcon size={14} />}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Audio Players */}
        {project.audio?.length > 0 && (
          <div className="space-y-3 pt-2">
            {project.audio.map((track, i) => (
              <div key={i} className="space-y-1">
                <span className="text-xs opacity-60">{track.label}</span>
                <audio
                  controls
                  className="w-full h-8 opacity-80"
                  style={{ filter: 'contrast(0.9)' }}
                >
                  <source src={track.url} type={track.url.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        )}

        {/* Image Gallery */}
        {project.images?.length > 0 && (
          <div className="space-y-4 pt-2">
            {project.images.map((image, i) => (
              <div key={i} className="space-y-1">
                <span className="text-xs opacity-60">{image.label}</span>
                <img
                  src={image.url}
                  alt={image.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ aspectRatio: getAspectRatio(image.url) }}
                  onClick={() => setLightboxImage(image)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Video Players */}
        {project.videos?.length > 0 && (
          <div className="space-y-4 pt-2">
            {project.videos.map((video, i) => {
              const isYouTube = isYouTubeUrl(video.url)
              const youtubeId = isYouTube ? extractYouTubeId(video.url) : null

              return (
                <div key={i} className="space-y-1">
                  <span className="text-xs opacity-60">{video.label}</span>
                  {isYouTube ? (
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      controls
                      className="w-full rounded-lg cursor-pointer"
                      style={{ aspectRatio: getAspectRatio(video.url) }}
                      playsInline
                      preload="metadata"
                    >
                      <source src={video.url} type={video.url.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tweet Embeds */}
        {project.tweets?.length > 0 && (
          <div className="space-y-4 pt-2">
            {project.tweets.map((tweet, i) => (
              <TweetEmbed key={tweet.id} tweetId={tweet.id} label={tweet.label} />
            ))}
          </div>
        )}

      </div>
      </div>

      {/* Image Lightbox - rendered via portal to ensure it's on top */}
      {createPortal(
        <AnimatePresence>
          {lightboxImage && (
            <ImageLightbox
              src={lightboxImage.url}
              alt={lightboxImage.label}
              onClose={() => setLightboxImage(null)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
