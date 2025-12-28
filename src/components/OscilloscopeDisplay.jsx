import { motion } from 'framer-motion'
import { fadeUp, ease } from '../utils/motion'
import OscilloscopeScreen from './OscilloscopeScreen'
import OscilloscopeControls from './OscilloscopeControls'

export default function OscilloscopeDisplay() {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.8, ease }}
      className="oscilloscope-housing"
    >
      {/* Tektronix branding area */}
      <div className="oscilloscope-header">
        <span className="oscilloscope-brand">Tektronix</span>
        <div className="oscilloscope-model">
          <span className="oscilloscope-model-number">2235A</span>
          <span className="oscilloscope-model-desc">100 MHz OSCILLOSCOPE</span>
        </div>
      </div>

      {/* Main body: Screen + Controls */}
      <div className="oscilloscope-body">
        <OscilloscopeScreen />
        <OscilloscopeControls />
      </div>

      {/* Bottom edge with ventilation lines */}
      <div className="oscilloscope-footer">
        <div className="oscilloscope-vent" />
        <div className="oscilloscope-vent" />
        <div className="oscilloscope-vent" />
      </div>
    </motion.div>
  )
}
