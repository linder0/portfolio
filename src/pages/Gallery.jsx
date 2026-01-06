import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { NetworkCanvas } from '../components/NodeNetwork'
import { projects, categories } from '../data/projects'
import { ease } from '../utils/motion'
import { getCategoryColor, GOLDEN_COLOR } from '../utils/graphLayout'
import { useScrollLockOnMount } from '../hooks/useScrollLock'

export default function Gallery() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [isLoaded, setIsLoaded] = useState(false)

  // Get initial project from URL query param
  const initialProjectId = searchParams.get('focus')

  // Lock scroll on mount, restore on unmount
  useScrollLockOnMount()

  // Called when 3D canvas is ready
  const handleReady = useCallback(() => setIsLoaded(true), [])

  return (
    <main className="h-screen overflow-hidden relative bg-theme">
      {/* Node Network Canvas - full page */}
      <div className="absolute inset-0">
        {/* Loading screen - only covers canvas area, below header/nav */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="absolute inset-0 z-[5] flex items-center justify-center bg-theme"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.3 }}
                className="label"
              >
                loading...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <NetworkCanvas
          projects={projects}
          activeCategory={activeCategory}
          initialFocusId={initialProjectId}
          onReady={handleReady}
        />
      </div>

      {/* Category filter - left-aligned to match header padding */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="absolute z-10
          lg:left-[44px] xl:left-[68px] lg:top-1/2 lg:-translate-y-1/2 lg:flex-col lg:items-start lg:gap-4 lg:pl-3
          bottom-6 left-0 right-0 flex justify-start gap-6 overflow-x-auto px-4 sm:px-6 md:px-10 pb-2
          lg:bottom-auto lg:right-auto lg:pb-0"
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
              className="relative label py-1 lg:py-0 transition-opacity duration-300 cursor-pointer shrink-0 hover:opacity-100"
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
                  {/* Desktop: vertical left line - positioned to the left of text */}
                  <motion.div
                    layoutId="category-sideline"
                    className="hidden lg:block absolute -left-3 top-0 bottom-0 w-px"
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
