import { motion } from 'framer-motion'

const sizes = [
  { id: 'S', cols: 5 },
  { id: 'M', cols: 4 },
  { id: 'L', cols: 2 },
]

export default function GridToggle({ activeSize, onSizeChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full accent-bg">
      {sizes.map((size) => (
        <button
          key={size.id}
          onClick={() => onSizeChange(size.cols)}
          className="relative label px-4 py-2 transition-colors duration-300"
        >
          {activeSize === size.cols && (
            <motion.div
              layoutId="grid-toggle-pill"
              className="absolute inset-0 rounded-full bg-theme"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{size.id}</span>
        </button>
      ))}
    </div>
  )
}
