import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/about', label: 'About' },
]

export default function Header() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentPage = navItems.find(item => item.path === location.pathname)
  const pageTitle = currentPage?.label || ''

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Background blur layer - fades out at bottom */}
      <div className="header-bg-blur absolute inset-0 pointer-events-none" />

      {/* Content layer - stays opaque */}
      <div className={`relative page-padding content-container flex items-center justify-between transition-theme !pl-14 ${
        scrolled ? 'py-2' : 'py-8'
      }`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {location.pathname !== '/' && (
            <span className={`font-display font-medium tracking-tight transition-theme ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>
              Linda Xue
            </span>
          )}
          <AnimatePresence>
            {scrolled && location.pathname !== '/' && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm opacity-50"
              >
                / {pageTitle}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative label transition-opacity duration-300 ${
                scrolled ? 'py-2' : 'py-3'
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-current"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
