import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePanelState } from '../context/PanelContext'
import { useTheme } from '../hooks/useTheme'
import { useScrollLock } from '../hooks/useScrollLock'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { SunIcon, MoonIcon, HamburgerIcon } from './Icons'
import StatusBadge from './StatusBadge'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/about', label: 'About' },
]

export default function Header({ onGalleryHover }) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isPanelOpen } = usePanelState()
  const isDesktop = useIsDesktop()
  const { theme, toggleTheme } = useTheme()

  // Lock scroll when mobile menu is open
  useScrollLock(mobileMenuOpen)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const currentPage = navItems.find(item => item.path === location.pathname)
  const pageTitle = currentPage?.label || ''

  return (
    <header className={`fixed top-0 left-0 right-0 ${mobileMenuOpen ? 'z-[70]' : 'z-50'}`}>
      {/* Background blur layer - fades out at bottom (hidden when mobile menu open) */}
      <div className={`header-bg-blur absolute inset-0 pointer-events-none ${mobileMenuOpen ? 'md:block hidden' : ''}`} />

      {/* Solid background for header when mobile menu is open */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 bg-theme md:hidden" />
      )}

      {/* Content layer - stays opaque, shifts when panel is open */}
      <div
        className={`relative z-[80] flex items-center justify-between transition-all duration-400 ease-out
          px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 ${
          scrolled ? 'py-2' : 'py-4 sm:py-6 md:py-8'
        } ${mobileMenuOpen ? 'bg-theme' : ''}`}
        style={{ paddingRight: isPanelOpen && isDesktop ? 'calc(28rem + 3.5rem)' : undefined }}
      >
        {/* Logo + Status */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <span className={`font-display font-medium tracking-tight transition-theme ${
                scrolled ? 'text-lg' : 'text-xl'
              }`}>
                Linda Xue
              </span>
            )}
          </Link>

          {/* Status Badge */}
          <StatusBadge />
        </div>

        {/* Navigation and Theme Toggle - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={item.path === '/gallery' ? onGalleryHover : undefined}
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:opacity-70 cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {theme === 'light' ? <SunIcon /> : <MoonIcon />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* Hamburger Button - Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <HamburgerIcon isOpen={mobileMenuOpen} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] md:hidden bg-theme"
          >
            {/* Menu Content */}
            <nav className="flex flex-col items-center justify-center h-full gap-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    onTouchStart={item.path === '/gallery' ? onGalleryHover : undefined}
                    className={`label text-base transition-opacity duration-300 ${
                      location.pathname === item.path ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Theme Toggle - icon only */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                onClick={toggleTheme}
                className="mt-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <SunIcon /> : <MoonIcon />}
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
