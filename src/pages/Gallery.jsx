import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NetworkCanvas } from '../components/NodeNetwork'
import { projects, categories } from '../data/projects'
import { ease } from '../utils/motion'
import { getCategoryColor, GOLDEN_COLOR } from '../utils/graphLayout'

export default function Gallery() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')

  // Get initial project from URL query param
  const initialProjectId = searchParams.get('project')

  // Lock scroll on mount, restore on unmount
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [])

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

      {/* Category filter pills - stacked on left edge */}
        <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
        className="absolute left-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2"
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
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 backdrop-blur-sm text-center cursor-pointer hover:scale-105 ${!isActive ? 'hover:opacity-100' : ''}`}
              style={{
                backgroundColor: isActive ? color : 'color-mix(in srgb, var(--bg) 80%, transparent)',
                color: isActive ? (category === 'all' ? 'var(--bg)' : 'white') : 'inherit',
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <span className="label" style={{ fontSize: '0.7rem' }}>
                {category === 'featured' ? '★ featured' : category}
              </span>
            </button>
          )
        })}
        </motion.div>

      {/* Reset hint */}
      {activeCategory !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className="label opacity-60 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-full backdrop-blur-sm cursor-pointer hover:scale-105"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}
          >
            ← Show all projects
          </button>
        </motion.div>
      )}
    </main>
  )
}
