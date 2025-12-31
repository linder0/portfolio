import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ease } from '../utils/motion'
import TagPill from './TagPill'
import { ArrowUpRightLarge } from './Icons'

/**
 * FeaturedCard - Animated project card for homepage
 *
 * Default state: Tags/Year at top, Title at bottom
 * Hover state: Title slides to top, Tagline fades in at bottom, Open icon appears
 */

// Animation timing constants
const TIMING = {
  fade: 300,      // ms - for fade transitions
  slide: 500,     // ms - for title slide
  delay: 200,     // ms - tagline appears after title starts moving
}

// Stagger delay between cards (in seconds for framer-motion)
const STAGGER_BASE = 0.3
const STAGGER_INCREMENT = 0.1

export default function FeaturedCard({ project, index = 0 }) {
  return (
    <Link to={`/gallery?project=${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: STAGGER_BASE + index * STAGGER_INCREMENT,
          ease
        }}
        className="
          md:flex-shrink-0 md:w-[360px]
          cursor-pointer group
        "
      >
        <div className="
          relative p-3 h-28 md:h-32
          rounded-xl accent-bg
          transition-theme overflow-hidden
        ">
          {/* Top row: Tags & Year - fades out on hover */}
          <div
            className="
              flex justify-between items-start gap-2
              transition-opacity ease-out group-hover:opacity-0
            "
            style={{ transitionDuration: `${TIMING.fade}ms` }}
          >
            {/* Tags: Featured + project tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.featured && (
                <TagPill variant="featured">Featured</TagPill>
              )}
              {project.tags?.slice(0, 2).map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>
            <span className="label opacity-50 flex-shrink-0">{project.year}</span>
          </div>

          {/* Open icon - fades in on hover (top right) */}
          <div
            className="
              absolute top-3 right-3
              opacity-0 transition-opacity ease-out group-hover:opacity-70
            "
            style={{
              transitionDuration: `${TIMING.fade}ms`,
              transitionDelay: `${TIMING.delay}ms`
            }}
          >
            <ArrowUpRightLarge />
          </div>

          {/* Title - positioned at top, uses CSS var for dynamic translation */}
          {/* --offset: content_height - title_height, calculated via calc(88px - 100%) */}
          {/* On hover, --offset becomes 0, sliding title to top */}
          <h3
            className="
              absolute top-3 left-3 right-3
              font-display text-xl md:text-2xl font-medium
              [--offset:calc(88px-100%)] md:[--offset:calc(104px-100%)]
              group-hover:[--offset:0px]
              translate-y-[var(--offset)]
              transition-transform ease-out
            "
            style={{ transitionDuration: `${TIMING.slide}ms` }}
          >
            {project.title}
          </h3>

          {/* Tagline - fades in at bottom after title moves */}
          <p
            className="
              absolute bottom-3 left-3 right-3
              text-sm opacity-0 line-clamp-2
              transition-opacity ease-out group-hover:opacity-70
            "
            style={{
              transitionDuration: `${TIMING.fade}ms`,
              transitionDelay: `${TIMING.delay}ms`
            }}
          >
            {project.tagline}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
