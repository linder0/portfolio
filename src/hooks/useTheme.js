import { useState, useEffect, useCallback } from 'react'

/**
 * Get system color scheme preference
 */
function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/**
 * Centralized theme management hook
 * Handles localStorage persistence and data-theme attribute
 * Defaults to system preference
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => getSystemTheme())

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const initialTheme = savedTheme || getSystemTheme()
    setThemeState(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  // Update theme with persistence
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme }
}
