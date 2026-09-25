import { useMemo, useState } from 'react'
import type { Mode } from '../music-core'

type ModeFamily = 'diatonic' | 'minor-altered' | 'pentatonic-blues'

interface ModePrototype {
  id: Mode
  family: ModeFamily
  tone: 'warm' | 'cool' | 'vibrant'
  name: string
  tagline: string
}

const families: Array<{ id: ModeFamily; label: string }> = [
  { id: 'diatonic', label: 'Diatonic' },
  { id: 'minor-altered', label: 'Minor Altered' },
  { id: 'pentatonic-blues', label: 'Pentatonic/Blues' },
]

const modePrototypes: ModePrototype[] = [
  { id: 'ionian', family: 'diatonic', tone: 'warm', name: 'Ionian', tagline: 'Stable major center' },
  { id: 'dorian', family: 'minor-altered', tone: 'cool', name: 'Dorian', tagline: 'Minor with lift' },
  { id: 'phrygian', family: 'minor-altered', tone: 'vibrant', name: 'Phrygian', tagline: 'Dark flat-two color' },
  { id: 'lydian', family: 'diatonic', tone: 'warm', name: 'Lydian', tagline: 'Bright raised-four float' },
  { id: 'mixolydian', family: 'diatonic', tone: 'warm', name: 'Mixolydian', tagline: 'Dominant and open' },
  { id: 'aeolian', family: 'minor-altered', tone: 'cool', name: 'Aeolian', tagline: 'Natural minor gravity' },
  { id: 'locrian', family: 'pentatonic-blues', tone: 'vibrant', name: 'Locrian', tagline: 'Unstable diminished pull' },
]

interface ModeGridProps {
  value: Mode | null
  onChange: (mode: Mode) => void
}

export function ModeGrid({ value, onChange }: ModeGridProps) {
  const [family, setFamily] = useState<ModeFamily>('diatonic')
  const visibleModes = useMemo(() => modePrototypes.filter((mode) => mode.family === family), [family])

  return (
    <section className="studio-card mode-grid-card" aria-labelledby="mode-grid-heading">
      <div className="studio-card-header">
        <p className="eyebrow">Scale module</p>
        <h3 id="mode-grid-heading">Mode cards</h3>
      </div>
      <div className="mode-tabs" role="tablist" aria-label="Mode families">
        {families.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === family}
            className={item.id === family ? 'is-active' : ''}
            onClick={() => setFamily(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mode-card-grid">
        {visibleModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`mode-card mode-card-${mode.tone}${mode.id === value ? ' is-active' : ''}`}
            aria-pressed={mode.id === value}
            onClick={() => onChange(mode.id)}
          >
            <strong>{mode.name}</strong>
            <span>{mode.tagline}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
