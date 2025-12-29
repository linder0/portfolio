import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProjectCard from '../components/ProjectCard'
import MediaPipeCanvas from '../components/MediaPipeCanvas'
import { projects } from '../data/projects'
import { fadeUp, ease } from '../utils/motion'

export default function Home() {
  const featuredProjects = projects.slice(0, 4)

  return (
    <main className="min-h-screen pt-32 pb-24 bg-theme">
      {/* Hero Section - MediaPipe Webcam */}
      <section className="page-padding mb-8 md:mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
        >
          <MediaPipeCanvas />
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section className="page-padding">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="label opacity-50">
              Featured Work
            </h2>
            <Link
              to="/gallery"
              className="label hover:opacity-100 transition-opacity"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + index * 0.1,
                  ease
                }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
