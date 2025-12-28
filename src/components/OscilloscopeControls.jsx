// Reusable sub-components for DRY code
const Knob = ({ label, showScale = false }) => (
  <div className="oscilloscope-channel">
    <div className="oscilloscope-channel-header">
      <span className="oscilloscope-channel-label">{label}</span>
    </div>
    <div className="oscilloscope-knob-container">
      <div className="oscilloscope-knob oscilloscope-knob-large">
        <div className="oscilloscope-knob-indicator" />
        <div className="oscilloscope-knob-inner">
          <span>CAL</span>
        </div>
      </div>
      {showScale && (
        <div className="oscilloscope-knob-scale">
          <span>5</span>
          <span>2</span>
          <span>1</span>
          <span>.5</span>
        </div>
      )}
    </div>
  </div>
)

const Switch = ({ label }) => (
  <div className="oscilloscope-switch-group">
    <div className="oscilloscope-switch" />
    <span>{label}</span>
  </div>
)

const BNCConnector = ({ label }) => (
  <div className="oscilloscope-bnc">
    <div className="oscilloscope-bnc-outer">
      <div className="oscilloscope-bnc-inner" />
    </div>
    <span>{label}</span>
  </div>
)

// Channel/knob configurations
const CHANNELS = [
  { label: 'CH 1 VOLTS/DIV', showScale: true },
  { label: 'CH 2 VOLTS/DIV', showScale: false },
  { label: 'A AND B SEC/DIV', showScale: false },
]

const SWITCHES = ['AC', 'GND', 'DC']
const CONNECTORS = ['CH 1', 'CH 2']

export default function OscilloscopeControls() {
  return (
    <div className="oscilloscope-controls">
      {/* Top labels row */}
      <div className="oscilloscope-controls-header">
        <div className="oscilloscope-label-group">
          <span className="oscilloscope-label-title">VERTICAL</span>
          <span className="oscilloscope-label-subtitle">A/B SWP SEP</span>
        </div>
        <div className="oscilloscope-label-group">
          <span className="oscilloscope-label-title">HORIZONTAL</span>
        </div>
      </div>

      {/* Main controls area - mapped from config */}
      <div className="oscilloscope-controls-main">
        {CHANNELS.map((channel) => (
          <Knob key={channel.label} {...channel} />
        ))}
      </div>

      {/* Bottom section with power, switches and connectors */}
      <div className="oscilloscope-controls-footer">
        {/* Power LED */}
        <div className="oscilloscope-power">
          <div className="oscilloscope-led" />
          <span>POWER</span>
        </div>

        {/* Mode switches - mapped from array */}
        <div className="oscilloscope-switches">
          {SWITCHES.map((label) => (
            <Switch key={label} label={label} />
          ))}
        </div>

        {/* BNC Connectors - mapped from array */}
        <div className="oscilloscope-connectors">
          {CONNECTORS.map((label) => (
            <BNCConnector key={label} label={label} />
          ))}
        </div>
      </div>
    </div>
  )
}
