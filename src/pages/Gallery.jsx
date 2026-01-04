import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NetworkCanvas } from '../components/NodeNetwork'
import { projects, categories } from '../data/projects'
import { ease } from '../utils/motion'
import { getCategoryColor, GOLDEN_COLOR } from '../utils/graphLayout'
import { useScrollLockOnMount } from '../hooks/useScrollLock'

export default function Gallery() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')

  // Get initial project from URL query param
  const initialProjectId = searchParams.get('project')

  // Lock scroll on mount, restore on unmount
  useScrollLockOnMount()

  return (
    <main className="h-screen overflow-hidden relative">
      {/* Node Network Canvas - full page */}
      <div className="absolute inset-0">
        <NetworkCanvas
          projects={projects}
          activeCategory={activeCategory}
          initialFocusId={initialProjectId}
        />
      </div>

      {/* Category filter - horizontal footer style */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="absolute z-10 bottom-6 lg:bottom-8 left-0 right-0
          flex justify-center gap-6 lg:gap-8 overflow-x-auto
          px-4 pb-2"
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
              className="relative label py-1 transition-opacity duration-300 cursor-pointer shrink-0 hover:opacity-100"
              style={{ opacity: isActive ? 1 : 0.5 }}
            >
              {category === 'featured' ? '★ featured' : category}
              {isActive && (
                <motion.div
                  layoutId="category-underline"
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ backgroundColor: color }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </motion.nav>

      {/* Reset hint - positioned above filter bar */}
      {activeCategory !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-14 lg:bottom-16 left-1/2 -translate-x-1/2 z-10"
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
