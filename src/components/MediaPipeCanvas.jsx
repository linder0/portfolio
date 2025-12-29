import { useRef, useEffect, useState } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { Eye, EyeClosed, Video, VideoOff, Play, Pause } from 'lucide-react'

// Physics constants
const FLOW_RADIUS = 180
const FLOW_STRENGTH = 150
const DRIFT_STRENGTH = 0.008
const FRICTION = 0.94
// Base sizes (will be scaled based on container width)
const BASE_FONT_SIZE = 120
const BASE_CHAR_WIDTH = 80
const BASE_WIDTH = 1200 // Reference width for scaling
const DISPLAY_TEXT = 'Linda Xue'
const BUTTON_CLASS = `p-2 bg-theme/80 hover:bg-theme hover:scale-110 cursor-pointer
                      opacity-80 hover:opacity-100 rounded-full backdrop-blur-md
                      transition-theme border border-current/20 hover:border-current/40`
const EDGE_FADE_CLASS = 'absolute inset-y-0 w-24 md:w-40 z-20 pointer-events-none transition-theme'

// Map normalized point to canvas coordinates (mirror if using camera)
const mapPoint = (point, offsetX, offsetY, renderWidth, renderHeight, mirror = false) => ({
  x: mirror
    ? offsetX + (1 - point.x) * renderWidth
    : offsetX + point.x * renderWidth,
  y: offsetY + point.y * renderHeight
})

class Letter {
  constructor(char, x, y, fontSize, sizeScale) {
    this.char = char
    this.baseX = x
    this.baseY = y
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    this.scale = 1
    this.rotation = 0
    this.fontSize = fontSize
    this.sizeScale = sizeScale // For scaling interaction radius
  }

  update(handPoints) {
    // Scale interaction radius with container size
    const flowRadius = FLOW_RADIUS * this.sizeScale
    const flowStrength = FLOW_STRENGTH * this.sizeScale

    let forceX = 0
    let forceY = 0

    for (const { x: handX, y: handY } of handPoints) {
      const dx = this.x - handX
      const dy = this.y - handY
      const distSq = dx * dx + dy * dy

      if (distSq < flowRadius * flowRadius && distSq > 0) {
        const dist = Math.sqrt(distSq)
        const t = 1 - dist / flowRadius

        // Push away
        const pushForce = t * t * flowStrength * 0.4
        forceX += (dx / dist) * pushForce
        forceY += (dy / dist) * pushForce

        // Flow around (perpendicular force)
        const perpX = -dy / dist
        const perpY = dx / dist
        const flowForce = t * flowStrength * 0.3
        const side = dx > 0 ? 1 : -1
        forceX += perpX * flowForce * side
        forceY += perpY * flowForce * side

        this.scale = 1 + t * 0.08
      }
    }

    this.vx += forceX * 0.006
    this.vy += forceY * 0.006

    // Drift back to base
    const dxBase = this.baseX - this.x
    const dyBase = this.baseY - this.y
    if (dxBase * dxBase + dyBase * dyBase > 1) {
      this.vx += dxBase * DRIFT_STRENGTH
      this.vy += dyBase * DRIFT_STRENGTH
    }

    this.vx *= FRICTION
    this.vy *= FRICTION
    this.x += this.vx
    this.y += this.vy

    this.rotation += (this.vx * 0.015 - this.rotation) * 0.15
    this.scale += (1 - this.scale) * 0.08
  }

  draw(ctx, textColor) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.scale(this.scale, this.scale)
    ctx.fillStyle = textColor
    ctx.font = `${this.fontSize}px "Cinema", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.char, 0, 0)
    ctx.restore()
  }
}

export default function MediaPipeCanvas() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showThumbnail, setShowThumbnail] = useState(true)
  const [error, setError] = useState(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const handLandmarkerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lettersRef = useRef([])
  const showOverlayRef = useRef(false)
  const streamRef = useRef(null)
  const useCameraRef = useRef(false)

  // Keep refs in sync with state for use in animation loop
  useEffect(() => {
    showOverlayRef.current = showOverlay
  }, [showOverlay])

  useEffect(() => {
    useCameraRef.current = useCamera
  }, [useCamera])

  // Toggle video play/pause
  function togglePlayPause() {
    const video = videoRef.current
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  // Stop camera stream helper
  function stopCameraStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  // Toggle camera on/off
  async function toggleCamera() {
    const video = videoRef.current
    if (useCamera) {
      stopCameraStream()
      video.srcObject = null
      video.src = '/videos/intro.mp4'
      await video.play()
      setUseCamera(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        })
        streamRef.current = stream
        video.srcObject = stream
        video.removeAttribute('src')
        await video.play()
        setUseCamera(true)
      } catch (err) {
        console.error('Camera error:', err)
        setError('Camera access denied')
      }
    }
  }

  // Initialize letters and draw during loading
  useEffect(() => {
    let animId

    function drawLoadingFrame() {
      const canvas = canvasRef.current
      const container = canvas?.parentElement
      if (!canvas || !container) {
        animId = requestAnimationFrame(drawLoadingFrame)
        return
      }

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      if (containerWidth === 0 || containerHeight === 0) {
        animId = requestAnimationFrame(drawLoadingFrame)
        return
      }

      // Initialize letters if not done
      if (lettersRef.current.length === 0) {
        initializeLetters(containerWidth, containerHeight)
      }

      // Draw letters on canvas during loading
      canvas.width = containerWidth
      canvas.height = containerHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const computedStyle = getComputedStyle(document.documentElement)
      const textColor = computedStyle.getPropertyValue('--text').trim()

      ctx.clearRect(0, 0, containerWidth, containerHeight)

      for (const letter of lettersRef.current) {
        letter.draw(ctx, textColor)
      }

      if (isLoading) {
        animId = requestAnimationFrame(drawLoadingFrame)
      }
    }

    drawLoadingFrame()

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [isLoading])

  function initializeLetters(width, height) {
    // Scale everything based on container width
    const scale = Math.min(1, width / BASE_WIDTH)
    const fontSize = BASE_FONT_SIZE * scale
    const charWidth = BASE_CHAR_WIDTH * scale

    const chars = DISPLAY_TEXT.split('')
    const totalWidth = chars.length * charWidth
    const startX = (width - totalWidth) / 2 + charWidth / 2

    lettersRef.current = chars.map((char, i) =>
      new Letter(char, startX + i * charWidth, height / 2, fontSize, scale)
    )
  }

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        // Initialize MediaPipe vision
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        // Create Hand Landmarker
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        })

        const video = videoRef.current

        // Wait for video to be ready (check if already ready first)
        if (video.readyState < 3) {
          await new Promise((resolve, reject) => {
            video.oncanplaythrough = resolve
            video.onerror = () => reject(new Error('Failed to load video'))
          })
        }

        if (!isMounted) return

        // Ensure video is playing
        if (video.paused) {
          await video.play()
        }

        // Re-initialize letters with final container size
        const container = canvasRef.current?.parentElement
        if (container) {
          initializeLetters(container.clientWidth, container.clientHeight)
        }

        setIsLoading(false)

        // Small delay + double RAF ensures the transition always animates
        setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (isMounted) setShowThumbnail(false)
            })
          })
        }, 50)

        detectFrame()
      } catch (err) {
        console.error('MediaPipe init error:', err)
        if (isMounted) {
          setError(err.message || 'Failed to initialize camera')
          setIsLoading(false)
        }
      }
    }

    function detectFrame() {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(detectFrame)
        return
      }

      const container = canvas.parentElement
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      if (containerWidth === 0 || containerHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(detectFrame)
        return
      }

      canvas.width = containerWidth
      canvas.height = containerHeight

      const videoAspect = video.videoWidth / video.videoHeight
      const containerAspect = containerWidth / containerHeight

      let renderWidth, renderHeight, offsetX, offsetY

      if (containerAspect > videoAspect) {
        renderWidth = containerWidth
        renderHeight = containerWidth / videoAspect
        offsetX = 0
        offsetY = (containerHeight - renderHeight) / 2
      } else {
        renderHeight = containerHeight
        renderWidth = containerHeight * videoAspect
        offsetX = (containerWidth - renderWidth) / 2
        offsetY = 0
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const computedStyle = getComputedStyle(document.documentElement)
      const textColor = computedStyle.getPropertyValue('--text').trim()

      const timestamp = performance.now()
      const allHandPoints = []
      const videoReady = video.readyState >= 2 && !video.paused && video.currentTime > 0
      const mirror = useCameraRef.current

      if (handLandmarkerRef.current && videoReady) {
        try {
          const handResults = handLandmarkerRef.current.detectForVideo(video, timestamp)
          if (showOverlayRef.current) {
            drawHandMesh(ctx, handResults, offsetX, offsetY, renderWidth, renderHeight, mirror)
          }

          if (handResults.landmarks) {
            for (const landmarks of handResults.landmarks) {
              for (const point of landmarks) {
                allHandPoints.push(mapPoint(point, offsetX, offsetY, renderWidth, renderHeight, mirror))
              }
            }
          }
        } catch (e) {
          console.warn('MediaPipe frame error:', e)
        }
      }

      for (const letter of lettersRef.current) {
        letter.update(allHandPoints)
        letter.draw(ctx, textColor)
      }

      if (showOverlayRef.current) {
        drawInteractionHints(ctx, allHandPoints)
      }

      animationFrameRef.current = requestAnimationFrame(detectFrame)
    }

    function drawInteractionHints(ctx, handPoints) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 100, 50, 0.1)'
      ctx.lineWidth = 1
      for (const { x, y } of handPoints) {
        ctx.beginPath()
        ctx.arc(x, y, 120, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    function drawHandMesh(ctx, results, offsetX, offsetY, renderWidth, renderHeight, mirror) {
      if (!results.landmarks?.length) return

      ctx.save()
      ctx.shadowColor = 'rgba(255, 100, 50, 0.8)'
      ctx.shadowBlur = 10
      ctx.strokeStyle = 'rgba(255, 100, 50, 0.9)'
      ctx.lineWidth = 2

      for (const landmarks of results.landmarks) {
        for (const { start, end } of HandLandmarker.HAND_CONNECTIONS) {
          const p1 = mapPoint(landmarks[start], offsetX, offsetY, renderWidth, renderHeight, mirror)
          const p2 = mapPoint(landmarks[end], offsetX, offsetY, renderWidth, renderHeight, mirror)
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }

        ctx.shadowBlur = 15
        ctx.fillStyle = 'rgba(255, 150, 100, 1)'
        for (const point of landmarks) {
          const { x, y } = mapPoint(point, offsetX, offsetY, renderWidth, renderHeight, mirror)
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    // Delay MediaPipe init to avoid competing with page animations
    const initTimer = setTimeout(init, 1500)

    return () => {
      isMounted = false
      clearTimeout(initTimer)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      stopCameraStream()
    }
  }, [])

  return (
    <div className="relative w-full aspect-[3/1] overflow-hidden bg-theme transition-theme">
      {/* Video element - fades in when loaded */}
      <video
        ref={videoRef}
        src={useCamera ? undefined : '/videos/intro.mp4'}
        className={`absolute inset-0 w-full h-full object-cover blur-[3px] grayscale transition-opacity duration-[5000ms] [transition-timing-function:cubic-bezier(0.7,0,0.3,1)] ${
          showThumbnail ? 'opacity-0' : 'opacity-100'
        } ${useCamera ? 'scale-x-[-1]' : ''}`}
        playsInline
        muted
        loop
        autoPlay
      />

      {/* Canvas for overlays and text - always on top */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
      />

      {/* Edge fade overlays */}
      <div className={`${EDGE_FADE_CLASS} left-0 bg-gradient-to-r from-[var(--bg)] to-transparent`} />
      <div className={`${EDGE_FADE_CLASS} right-0 bg-gradient-to-l from-[var(--bg)] to-transparent`} />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-theme/90 transition-theme">
          <div className="text-center px-8">
            <p className="text-red-500 text-sm mb-2">Error</p>
            <p className="opacity-50 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Control buttons */}
      {!isLoading && !error && (
        <>
          {/* Play/Pause - bottom left */}
          <button
            onClick={togglePlayPause}
            className={`absolute bottom-4 left-4 z-30 ${BUTTON_CLASS}`}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Camera & Overlay toggles - bottom right */}
          <div className="absolute bottom-4 right-4 z-30 flex gap-2">
            <button
              onClick={toggleCamera}
              className={BUTTON_CLASS}
              aria-label={useCamera ? 'Switch to video' : 'Enable camera'}
            >
              {useCamera ? <VideoOff size={16} /> : <Video size={16} />}
            </button>
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={BUTTON_CLASS}
              aria-label={showOverlay ? 'Hide mesh overlay' : 'Show mesh overlay'}
            >
              {showOverlay ? <Eye size={16} /> : <EyeClosed size={16} />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
