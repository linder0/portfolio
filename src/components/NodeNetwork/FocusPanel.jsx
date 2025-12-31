import { motion } from 'framer-motion'
import { ease } from '../../utils/motion'
import { getCategoryColor } from '../../utils/graphLayout'
import TagPill from '../TagPill'
import { ArrowUpRight } from '../Icons'

/**
 * FocusPanel - Project detail overlay for Gallery
 * Slides in from right when a project node is clicked
 */

// --- Sub-components ---

/** Colored category badge */
const CategoryBadge = ({ category }) => (
  <span
    className="px-3 py-1 rounded-full text-white text-xs uppercase tracking-wider"
    style={{ backgroundColor: getCategoryColor(category) }}
  >
    {category}
  </span>
)

/** Featured star badge */
const FeaturedBadge = () => (
  <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-theme border border-current opacity-70">
    ★ Featured
  </span>
)

/** Label + value metadata item */
const MetadataItem = ({ label, value }) => (
  <div>
    <span className="label opacity-50 block mb-1">{label}</span>
    <span className="text-sm">{value}</span>
  </div>
)

/** External link button with arrow */
const LinkButton = ({ href, label, isPrimary, color }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-100"
    style={{
      backgroundColor: isPrimary ? color : 'var(--accent)',
      color: isPrimary ? 'white' : 'inherit',
      opacity: 0.9,
    }}
  >
    {label}
    <ArrowUpRight />
  </a>
)

// --- Main Component ---

export default function FocusPanel({ project, onClose }) {
  const categoryColor = getCategoryColor(project.category)

  // Build metadata items array (only include if value exists)
  const metadata = [
    { label: 'Role', value: project.role },
    { label: 'Client', value: project.client },
    { label: 'Duration', value: project.duration },
    { label: 'Year', value: project.year },
  ].filter(item => item.value)

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease }}
      className="absolute top-0 right-0 w-full max-w-md h-full bg-theme/95 backdrop-blur-md border-l overflow-y-auto"
      style={{ borderColor: 'var(--accent)' }}
    >
      <div className="p-8 pt-32 space-y-6">

        {/* Badges: Category + Featured */}
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={project.category} />
          {project.featured && <FeaturedBadge />}
        </div>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map(tag => (
              <TagPill key={tag} variant="subtle">{tag}</TagPill>
            ))}
          </div>
        )}

        {/* Title & Tagline */}
        <div>
          <h2 className="font-display text-3xl mb-2">{project.title}</h2>
          <p className="text-lg opacity-60">{project.tagline}</p>
        </div>

        {/* Description */}
        <p className="leading-relaxed">{project.description}</p>

        {/* Metadata Grid */}
        {metadata.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {metadata.map(({ label, value }) => (
              <MetadataItem key={label} label={label} value={value} />
            ))}
          </div>
        )}

        {/* Tools */}
        {project.tools?.length > 0 && (
          <div>
            <span className="label opacity-50 block mb-3">Tools & Technologies</span>
            <div className="flex flex-wrap gap-2">
              {project.tools.map(tool => (
                <TagPill key={tool}>{tool}</TagPill>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {project.links?.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {project.links.map((link, i) => (
              <LinkButton
                key={link.url}
                href={link.url}
                label={link.label}
                isPrimary={i === 0}
                color={categoryColor}
              />
            ))}
          </div>
        )}

      </div>
    </motion.div>
  )
}
