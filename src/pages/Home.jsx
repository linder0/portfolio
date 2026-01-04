import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MediaPipeCanvas from '../components/MediaPipeCanvas'
import FeaturedCard from '../components/FeaturedCard'
import { projects } from '../data/projects'
import { fadeUp, ease } from '../utils/motion'

export default function Home() {
  const featuredProjects = projects.filter(p => p.featured).slice(0, 4)

  return (
    <main className="pb-8 bg-theme md:h-screen md:pb-0 md:flex md:flex-col md:overflow-hidden">
      {/* Hero Section - MediaPipe Webcam */}
      <section className="mb-8 md:mb-0 md:flex-1 md:min-h-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="h-full"
        >
          <MediaPipeCanvas className="md:h-full" />
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section className="md:flex-shrink-0 md:py-6">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div className="
            grid grid-cols-1 gap-4 px-6
            md:flex md:items-center md:overflow-x-auto md:gap-5 md:pl-5 md:pr-0
          ">
            {featuredProjects.map((project, index) => (
              <FeaturedCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
            {/* See All Card */}
            <Link
              to="/gallery"
              className="
                flex items-center justify-center
                h-28 md:h-32 md:w-40 md:flex-shrink-0
                rounded-xl accent-bg
                transition-all duration-300
                group
              "
            >
              <span className="label opacity-50 group-hover:opacity-100 transition-opacity">
                See All →
              </span>
            </Link>
            {/* Right padding spacer */}
            <div className="hidden md:block md:flex-shrink-0 md:w-5" />
          </div>
        </motion.div>
      </section>
    </main>
  )
}
