// Shared animation configuration for consistent motion across the site

// Standard easing curve - matches Apple's human interface guidelines
export const ease = [0.4, 0, 0.2, 1]

// Common animation variants
export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export const fadeUpSmall = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// Standard transition config
export const transition = {
  duration: 0.8,
  ease,
}
