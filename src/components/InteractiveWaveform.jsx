import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'

export default function InteractiveWaveform({ containerRef }) {
  const pathRef = useRef(null)
  const [waveParams, setWaveParams] = useState({ frequency: 3, amplitude: 40 })

  // Generate SVG path for sine wave
  const generateWavePath = useCallback((freq, amp) => {
    const width = 400
    const height = 200
    const centerY = height / 2
    const points = []
    const steps = 200

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width
      const y = centerY + Math.sin((i / steps) * Math.PI * 2 * freq) * amp
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    }

    return points.join(' ')
  }, [])

  // Smooth GSAP animation for wave parameters
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      // Map x position to frequency (1-6 cycles)
      const targetFreq = 1 + x * 5
      // Map y position to amplitude (20-80)
      const targetAmp = 20 + (1 - y) * 60

      setWaveParams({ frequency: targetFreq, amplitude: targetAmp })
    }

    const handleMouseLeave = () => {
      // Return to default state
      setWaveParams({ frequency: 3, amplitude: 40 })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [containerRef])

  // Animate path changes with GSAP
  useEffect(() => {
    if (!pathRef.current) return

    const newPath = generateWavePath(waveParams.frequency, waveParams.amplitude)

    gsap.to(pathRef.current, {
      attr: { d: newPath },
      duration: 0.3,
      ease: 'power2.out'
    })
  }, [waveParams, generateWavePath])

  // Initial path
  const initialPath = generateWavePath(3, 40)

  return (
    <svg
      className="oscilloscope-wave"
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
    >
      {/* Glow filter */}
      <defs>
        <filter id="phosphorGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feGaussianBlur stdDeviation="12" result="blur3" />
          <feMerge>
            <feMergeNode in="blur3" />
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main waveform path */}
      <path
        ref={pathRef}
        d={initialPath}
        fill="none"
        stroke="#00FFB4"
        strokeWidth="2.5"
        filter="url(#phosphorGlow)"
        className="oscilloscope-wave-path"
      />

      {/* Secondary trace (slightly offset, creates depth) */}
      <path
        d={initialPath}
        fill="none"
        stroke="#00FFB4"
        strokeWidth="1"
        opacity="0.3"
        style={{ transform: 'translateY(2px)' }}
      />
    </svg>
  )
}
