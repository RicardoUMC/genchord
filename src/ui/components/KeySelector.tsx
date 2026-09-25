import type { Mode, NoteName } from '../../music-core'

const rootNotes: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'ionian', label: 'Ionian (Major)' },
  { value: 'dorian', label: 'Dorian' },
  { value: 'phrygian', label: 'Phrygian' },
  { value: 'lydian', label: 'Lydian' },
  { value: 'mixolydian', label: 'Mixolydian' },
  { value: 'aeolian', label: 'Aeolian (Natural Minor)' },
  { value: 'locrian', label: 'Locrian' },
  { value: 'harmonic-minor', label: 'Harmonic Minor' },
  { value: 'melodic-minor', label: 'Melodic Minor' },
]

interface KeySelectorProps {
  root: NoteName | null
  mode: Mode | null
  onRootChange: (root: NoteName) => void
  onModeChange: (mode: Mode) => void
  onInteract: () => void
}

export function KeySelector({ root, mode, onRootChange, onModeChange, onInteract }: KeySelectorProps) {
  return (
    <section className="panel key-selector" aria-labelledby="key-selector-heading">
      <div>
        <p className="eyebrow">Context</p>
        <h2 id="key-selector-heading">Choose the key</h2>
      </div>
      <label className="field">
        Root note
        <select
          value={root ?? ''}
          onChange={(event) => {
            onInteract()
            onRootChange(event.target.value as NoteName)
          }}
        >
          <option value="">Select root</option>
          {rootNotes.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Scale / Mode
        <select
          value={mode ?? ''}
          disabled={!root}
          onChange={(event) => {
            onInteract()
            onModeChange(event.target.value as Mode)
          }}
        >
          <option value="">Select mode</option>
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
