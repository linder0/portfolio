import { useState, useEffect, useCallback } from 'react'

/**
 * Centralized theme management hook
 * Handles localStorage persistence and data-theme attribute
 */
export function useTheme() {
  const [theme, setThemeState] = useState('light')

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setThemeState(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
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
