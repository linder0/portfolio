import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LampToggle() {
  const [theme, setTheme] = useState('light')
  const [isPulling, setIsPulling] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    setIsPulling(true)
    setTimeout(() => {
      const newTheme = theme === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      setIsPulling(false)
    }, 200)
  }

  // Calculate cord height based on state
  const getCordHeight = () => {
    if (isPulling) return 104
    if (isHovering) return 88
    return 80
  }

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="fixed top-0 right-12 z-[999] flex flex-col items-center cursor-pointer group"
      aria-label="Toggle theme"
    >
      {/* Cord - height adjusts so bead always connects */}
      <motion.div
        className="w-px bg-current origin-top"
        animate={{ height: getCordHeight() }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ opacity: 0.4 }}
      />

      {/* Bead - no y translation, just follows the cord */}
      <motion.div
        className="lamp-bead w-4 h-4 rounded-full bg-current transition-shadow duration-600"
        animate={{ scale: isPulling ? 1.1 : 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </button>
  )
}
