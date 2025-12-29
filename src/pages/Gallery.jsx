import { useState } from 'react'
import { motion } from 'framer-motion'
import ProjectCard from '../components/ProjectCard'
import GridToggle from '../components/GridToggle'
import { projects } from '../data/projects'
import { fadeUpSmall, ease } from '../utils/motion'

export default function Gallery() {
  const [gridCols, setGridCols] = useState(4)

  const getGridClass = () => {
    switch (gridCols) {
      case 5: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      case 4: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
      case 2: return 'grid-cols-1 sm:grid-cols-2'
      default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
    }
  }

  return (
    <main className="min-h-screen pt-32 pb-24 content-container">
      <section className="page-padding">
        {/* Header */}
        <motion.div
          {...fadeUpSmall}
          transition={{ duration: 0.6, ease }}
          className="flex items-center justify-between mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl">Gallery</h1>
          <GridToggle activeSize={gridCols} onSizeChange={setGridCols} />
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className={`grid ${getGridClass()} gap-4`}
          transition={{ duration: 0.4, ease }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease
              }}
            >
              <ProjectCard project={project} showYear />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
