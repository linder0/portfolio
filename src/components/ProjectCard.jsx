import { motion } from 'framer-motion'
import { ease } from '../utils/motion'

export default function ProjectCard({ project, showYear = false }) {
  return (
    <motion.div
      className="relative aspect-square overflow-hidden cursor-pointer group"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      {/* Image */}
      <motion.img
        src={project.thumbnail}
        alt={project.title}
        className="w-full h-full object-cover"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.05 },
        }}
        transition={{ duration: 0.4, ease }}
      />

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 0.6 },
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end p-6 text-white"
        variants={{
          rest: { opacity: 0, y: 10 },
          hover: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3 }}
      >
        <span className="label text-white/70 mb-2">
          {project.category}
        </span>
        <h3 className="font-display text-xl font-medium">
          {project.title}
        </h3>
        {showYear && (
          <span className="text-sm text-white/50 mt-2">
            {project.year}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}
