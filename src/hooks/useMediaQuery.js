import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive breakpoints
 * Provides consistent media query handling across the app
 */

/**
 * Generic media query hook
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
    // Legacy support
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [query])

  return matches
}

/**
 * Check if viewport is mobile (<1024px)
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 1023px)')
}

/**
 * Check if viewport is desktop (>=1024px)
 */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

