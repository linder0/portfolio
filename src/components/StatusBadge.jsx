import { motion } from 'framer-motion'
import { status } from '../data/about'

export default function StatusBadge() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 label">
      <span className="relative flex items-center justify-center h-3 w-3">
        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-current opacity-50" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      <span>{status.location}</span>
      <span className="opacity-50">|</span>
      <span>{status.working}</span>
    </motion.div>
  )
}
