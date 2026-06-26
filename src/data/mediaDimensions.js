/**
 * Intrinsic [width, height] of project & site media.
 * Used to reserve layout space via CSS aspect-ratio so images/videos don't
 * cause content layout shift (CLS) as they load.
 */
export const mediaDimensions = {
  // Images
  '/images/hangful/thumbnail.png': [2704, 1684],
  '/images/hangful/demo.png': [2704, 1682],
  '/images/gemini/monkeyyy.png': [1024, 1024],
  '/images/gemini/home.png': [2704, 1685],
  '/images/gemini/library.png': [2704, 1685],
  '/images/monography/logo.png': [1200, 1200],
  '/images/monography/homepage.png': [1920, 1080],
  '/images/pookie/thumbnail.png': [948, 597],
  '/images/chameleon/render.png': [1647, 547],
  '/images/chameleon/chameleon-thumb.jpeg': [480, 360],
  '/images/chameleon/chameleon-3.jpeg': [480, 360],
  '/images/chameleon/chameleon-4.jpeg': [480, 360],
  '/images/chameleon/chameleon-6.jpeg': [480, 360],
  '/images/chimes/chimes-thumb.jpg': [1080, 1080],
  '/images/chimes/chimes-thumbnail.jpeg': [480, 360],
  '/images/chimes/chimes-sideview.jpeg': [480, 360],
  '/images/chimes/chimes-topview.jpeg': [480, 360],
  '/images/chimes/chimes-gallery.gif': [800, 800],
  '/images/petri-dishes/petri-dishes-thumb.jpg': [2066, 2066],
  '/images/petri-dishes/petri-dishes.png': [942, 1232],
  '/images/nanostalgia/nanostalgia-thumb.jpg': [1080, 1080],
  '/images/nanostalgia/nanostalgia-render.png': [960, 540],
  '/images/roach/roach.jpeg': [1024, 768],
  '/images/gaze/gaze-stars.jpg': [6000, 3375],
  '/images/site/linda.png': [1000, 1000],
  // Videos
  '/videos/gemini/demo.mp4': [1280, 826],
  '/videos/chimes/chimes-demo.mp4': [1280, 776],
  '/videos/gaze/braille-machine.mp4': [720, 1280],
  '/videos/gaze/eye-display.mp4': [720, 1280],
  '/videos/gaze/gaze-dj.mp4': [538, 960],
}

/** CSS aspect-ratio string ("w / h") for a media URL, or undefined if unknown. */
export function getAspectRatio(url) {
  const dims = url && mediaDimensions[url]
  return dims ? `${dims[0]} / ${dims[1]}` : undefined
}
