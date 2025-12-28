import { useRef } from 'react'
import InteractiveWaveform from './InteractiveWaveform'

export default function OscilloscopeScreen() {
  const screenRef = useRef(null)

  return (
    <div className="oscilloscope-screen-container">
      {/* Outer bezel */}
      <div className="oscilloscope-bezel">
        {/* CRT Screen */}
        <div ref={screenRef} className="oscilloscope-screen">
          {/* Grid overlay - 8x10 divisions */}
          <div className="oscilloscope-grid" />

          {/* Center crosshair markers */}
          <div className="oscilloscope-center-marker oscilloscope-center-h" />
          <div className="oscilloscope-center-marker oscilloscope-center-v" />

          {/* Interactive waveform */}
          <InteractiveWaveform containerRef={screenRef} />

          {/* CRT glass reflection effect */}
          <div className="oscilloscope-reflection" />

          {/* Scanline overlay */}
          <div className="oscilloscope-scanlines" />
        </div>
      </div>

    </div>
  )
}
