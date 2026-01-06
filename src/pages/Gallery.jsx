import { useState, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects, categories } from '../data/projects'
import { ease } from '../utils/motion'
import { getCategoryColor, GOLDEN_COLOR } from '../utils/graphLayout'
import { useScrollLockOnMount } from '../hooks/useScrollLock'

// Lazy load the heavy 3D graph so tag toggle renders immediately
const NetworkCanvas = lazy(() => import('../components/NodeNetwork/NetworkCanvas'))

// Loading state for the graph - subtle fade-in
const GraphLoading = () => (
  <div className="w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      className="label text-muted"
    >
      loading...
    </motion.div>
  </div>
)

export default function Gallery() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')

  // Get initial project from URL query param
  const initialProjectId = searchParams.get('focus')

  // Lock scroll on mount, restore on unmount
  useScrollLockOnMount()

  return (
    <main className="h-screen overflow-hidden relative">
      {/* Node Network Canvas - full page, lazy loaded */}
      <div className="absolute inset-0">
        <Suspense fallback={<GraphLoading />}>
          <NetworkCanvas
            projects={projects}
            activeCategory={activeCategory}
            initialFocusId={initialProjectId}
          />
        </Suspense>
      </div>

      {/* Category filter - vertical on desktop left, horizontal bottom on mobile */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
        className="absolute z-10
          lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col lg:items-start lg:gap-4
          bottom-6 left-0 right-0 flex justify-center gap-6 overflow-x-auto px-4 pb-2
          lg:bottom-auto lg:right-auto lg:px-0 lg:pb-0"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category
          // Special gold color for 'featured', text color for 'all', category color for others
          const color = category === 'featured'
            ? GOLDEN_COLOR
            : category === 'all'
              ? 'var(--text)'
              : getCategoryColor(category)

          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="relative label py-1 lg:pl-3 lg:py-0 transition-opacity duration-300 cursor-pointer shrink-0 hover:opacity-100"
              style={{ opacity: isActive ? 1 : 0.5 }}
            >
              {category === 'featured' ? '★ featured' : category}
              {isActive && (
                <>
                  {/* Mobile: horizontal underline */}
                  <motion.div
                    layoutId="category-underline"
                    className="lg:hidden absolute bottom-0 left-0 right-0 h-px"
                    style={{ backgroundColor: color }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                  {/* Desktop: vertical left line */}
                  <motion.div
                    layoutId="category-sideline"
                    className="hidden lg:block absolute left-0 top-0 bottom-0 w-px"
                    style={{ backgroundColor: color }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </>
              )}
            </button>
          )
        })}
      </motion.nav>

      {/* Show all button - bottom center for both mobile and desktop */}
      {activeCategory !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-14 lg:bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className="label opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          >
            ← show all
          </button>
        </motion.div>
      )}
    </main>
  )
}
