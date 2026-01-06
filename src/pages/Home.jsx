import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import MediaPipeCanvas from '../components/MediaPipeCanvas'
import FeaturedCard from '../components/FeaturedCard'
import { projects } from '../data/projects'
import { fadeUp, ease } from '../utils/motion'
import { useIsDesktop } from '../hooks/useMediaQuery'

export default function Home() {
  const [hasDragged, setHasDragged] = useState(false)
  const marqueeRef = useRef(null)
  const containerRef = useRef(null)
  const positionRef = useRef(0)
  const animationRef = useRef(null)
  const dragStartRef = useRef({ x: 0, position: 0 })
  const isHoveredRef = useRef(false)
  const isDraggingRef = useRef(false)
  const isDesktop = useIsDesktop()

  // Duplicate projects for seamless infinite scroll (desktop only)
  const marqueeProjects = isDesktop ? [...projects, ...projects] : projects

  // Animate marquee with JavaScript for smooth speed changes (desktop only)
  useEffect(() => {
    if (!isDesktop) return

    const marquee = marqueeRef.current
    if (!marquee) return

    let lastTime = performance.now()

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Speed: pixels per second (stop when hovered or dragging)
      const speed = (isHoveredRef.current || isDraggingRef.current) ? 0 : 30
      positionRef.current += (speed * deltaTime) / 1000

      // Get half width for seamless loop (we duplicated the projects)
      const halfWidth = marquee.scrollWidth / 2

      // Reset position when we've scrolled half (seamless loop)
      if (positionRef.current >= halfWidth) {
        positionRef.current = positionRef.current - halfWidth
      }
      if (positionRef.current < 0) {
        positionRef.current = positionRef.current + halfWidth
      }

      marquee.style.transform = `translateX(-${positionRef.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDesktop])

  // Add non-passive wheel listener to allow preventDefault
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isDesktop) return

    const handleWheel = (e) => {
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      positionRef.current += delta * 0.5
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [isDesktop])

  // Drag handlers for manual scrolling
  const handleDragStart = (clientX) => {
    isDraggingRef.current = true
    setHasDragged(false)
    dragStartRef.current = { x: clientX, position: positionRef.current }
  }

  const handleDragMove = (clientX) => {
    if (!isDraggingRef.current) return
    const delta = dragStartRef.current.x - clientX
    // Only consider it a drag if moved more than 5px (prevents accidental drags on clicks)
    if (Math.abs(delta) > 5) {
      setHasDragged(true)
    }
    positionRef.current = dragStartRef.current.position + delta
  }

  const handleDragEnd = () => {
    isDraggingRef.current = false
    // Reset hasDragged after a brief delay so click events are properly blocked/allowed
    setTimeout(() => setHasDragged(false), 0)
  }

  // Mouse events
  const onMouseDown = (e) => handleDragStart(e.clientX)
  const onMouseMove = (e) => handleDragMove(e.clientX)
  const onMouseUp = () => handleDragEnd()
  const onMouseLeave = () => {
    handleDragEnd()
    isHoveredRef.current = false
  }

  // Touch events
  const onTouchStart = (e) => handleDragStart(e.touches[0].clientX)
  const onTouchMove = (e) => handleDragMove(e.touches[0].clientX)
  const onTouchEnd = () => handleDragEnd()

  return (
    <main className="pb-4 bg-theme md:h-screen md:pb-0 md:flex md:flex-col md:overflow-hidden">
      {/* Hero Section - MediaPipe Webcam */}
      <section className="mb-4 md:mb-0 md:flex-1 md:min-h-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="h-full"
        >
          <MediaPipeCanvas className="md:h-full" />
        </motion.div>
      </section>

      {/* Projects - Stacked on mobile, Marquee on desktop */}
      <section className="px-4 md:px-0 md:flex-shrink-0 md:py-3 md:overflow-hidden">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          {/* Mobile: stacked vertical layout */}
          <div className="flex flex-col gap-4 md:hidden">
            {projects.map((project, index) => (
              <FeaturedCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>

          {/* Desktop: horizontal marquee with drag support */}
          <div
            ref={containerRef}
            className="hidden md:flex cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onMouseEnter={() => { isHoveredRef.current = true }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={marqueeRef}
              className="flex gap-3 px-3"
              style={{ pointerEvents: hasDragged ? 'none' : 'auto' }}
            >
              {marqueeProjects.map((project, index) => (
                <FeaturedCard
                  key={`${project.id}-${index}`}
                  project={project}
                  index={0}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
