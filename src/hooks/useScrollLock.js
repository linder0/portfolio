import { useEffect } from 'react'

/**
 * Lock body scroll when condition is true
 * @param {boolean} isLocked - Whether to lock scrolling
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      // Lock scroll on both html and body
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.inset = '0'
      document.body.style.overscrollBehavior = 'none'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.inset = ''
      document.body.style.overscrollBehavior = ''
    }

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.inset = ''
      document.body.style.overscrollBehavior = ''
    }
  }, [isLocked])
}

/**
 * Lock scroll on mount, restore on unmount
 * Useful for full-page layouts like Gallery
 */
export function useScrollLockOnMount() {
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [])
}


