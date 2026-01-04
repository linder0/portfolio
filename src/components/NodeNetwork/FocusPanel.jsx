import { motion } from 'framer-motion'
import { ease } from '../../utils/motion'
import { getCategoryColor } from '../../utils/graphLayout'
import { useIsMobile } from '../../hooks/useMediaQuery'
import TagPill from '../TagPill'
import { ArrowUpRight, CloseIcon } from '../Icons'
import MediaHero from '../MediaHero'

/**
 * FocusPanel - Minimal project detail overlay for Gallery
 *
 * Layout:
 * - Desktop (lg+): Right-side panel, slides from right
 * - Mobile (<lg): Bottom sheet, slides from bottom, 75vh height
 */

// --- Sub-components ---

/** Colored category badge */
const CategoryBadge = ({ category }) => (
  <span
    className="px-2 py-0.5 rounded-full text-white text-xs uppercase tracking-wider"
    style={{ backgroundColor: getCategoryColor(category) }}
  >
    {category}
  </span>
)

// --- Main Component ---

export default function FocusPanel({ project, onClose }) {
  const categoryColor = getCategoryColor(project.category)
  const isMobile = useIsMobile()

  // Get primary link (first one)
  const primaryLink = project.links?.[0]

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
      className={`absolute z-[60] overflow-y-auto ${
        isMobile
          ? 'inset-0'
          : 'top-0 right-0 w-full max-w-md h-full border-l'
      }`}
      style={{
        backgroundColor: 'var(--accent)',
        borderColor: isMobile ? undefined : 'color-mix(in srgb, var(--text) 15%, transparent)'
      }}
    >
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
        <div className="flex items-center gap-4">
          <span className="label opacity-50">{project.year}</span>
          {!isMobile && (
            <button
              onClick={onClose}
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close panel"
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Hero Media */}
      {project.media && (
        <div className="px-6 mb-6">
          <MediaHero media={project.media} />
        </div>
      )}

      <div className="px-6 pb-8 space-y-4">
        {/* Title */}
        <h2 className="text-3xl font-medium">{project.title}</h2>

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

        {/* Primary CTA */}
        {primaryLink && (
          <a
            href={primaryLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: categoryColor }}
          >
            {primaryLink.label}
            <ArrowUpRight />
          </a>
        )}
      </div>
    </motion.div>
  )
}
