import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ease } from '../utils/motion'
import { getMediaThumbnail } from '../utils/media'
import { ArrowUpRightLarge } from './Icons'

/**
 * FeaturedCard - Animated project card for homepage marquee
 *
 * Features:
 * - Thumbnail image background with gradient overlay
 * - Tags/year visible by default, fade on hover
 * - Title slides from bottom to top on hover
 * - Tagline fades in on hover
 * - Clicking anywhere on card opens project in gallery
 */

// Animation timing (ms)
const TIMING = {
  fade: 300,
  slide: 500,
  delay: 200,
}

// Shared styles
const STYLES = {
  tag: 'label text-[10px] uppercase tracking-wider',
  // Title positioned at top, translated down so bottom aligns with card bottom
  // On hover, translateY(0) brings top edge flush with top
  title: `
    absolute top-3 left-3 right-3
    text-2xl md:text-3xl font-light uppercase tracking-wider leading-tight
    translate-y-[calc(120px-100%)] md:translate-y-[calc(152px-100%)]
    group-hover:translate-y-0
    transition-transform duration-500 ease-out
  `,
}

export default function FeaturedCard({ project, index = 0 }) {
  const imageUrl = getMediaThumbnail(project.media)

  return (
    <Link to={`/gallery?focus=${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease }}
        className="w-full md:flex-shrink-0 md:w-[420px] cursor-pointer group"
      >
        <div className="relative p-3 h-36 md:h-44 rounded-xl overflow-hidden">
          {/* Background */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 accent-bg" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Tags & Year - fade out on hover */}
          <div
            className="relative z-10 flex justify-between items-start gap-2 transition-opacity ease-out group-hover:opacity-0"
            style={{ transitionDuration: `${TIMING.fade}ms`, color: 'rgba(255,255,255,0.7)' }}
          >
            <div className="flex flex-wrap gap-3">
              {project.featured && (
                <span className={STYLES.tag} style={{ color: 'white' }}>Featured</span>
              )}
              {project.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className={STYLES.tag}>{tag}</span>
              ))}
            </div>
            <span className="label flex-shrink-0">{project.year}</span>
          </div>

          {/* Arrow icon - fade in on hover */}
          <div
            className="absolute top-3 right-3 z-10 opacity-0 transition-opacity ease-out group-hover:opacity-70"
            style={{ color: 'white', transitionDuration: `${TIMING.fade}ms`, transitionDelay: `${TIMING.delay}ms` }}
          >
            <ArrowUpRightLarge />
          </div>

          {/* Title - slides up on hover */}
          <span
            className={`${STYLES.title} z-10`}
            style={{ color: 'white', fontWeight: 300 }}
          >
            {project.title}
          </span>

          {/* Tagline - fade in on hover */}
          <p
            className="absolute bottom-3 left-3 right-3 z-10 text-sm opacity-0 line-clamp-2 transition-opacity ease-out group-hover:opacity-70"
            style={{ color: 'white', transitionDuration: `${TIMING.fade}ms`, transitionDelay: `${TIMING.delay}ms` }}
          >
            {project.tagline}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
