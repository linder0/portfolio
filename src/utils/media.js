// Media utility functions

/** Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/)
  return match ? match[1] : ''
}

/** Extract Vimeo video ID from URL */
export function extractVimeoId(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : ''
}

/** Check if URL is a YouTube link */
export function isYouTubeUrl(url) {
  return url.includes('youtube') || url.includes('youtu.be')
}

/** Check if URL is a Vimeo link */
export function isVimeoUrl(url) {
  return url.includes('vimeo')
}
