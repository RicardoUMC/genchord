import type { CSSProperties } from 'react'
import type { NoteName } from '../music-core'

const fifths: NoteName[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F']

interface KeySelectorWheelProps {
  value: NoteName | null
  onChange: (root: NoteName) => void
  onInteract?: () => void
}

export function KeySelectorWheel({ value, onChange, onInteract }: KeySelectorWheelProps) {
  return (
    <section className="studio-card key-wheel-card" aria-labelledby="key-wheel-heading">
      <div className="studio-card-header">
        <p className="eyebrow">Variant B</p>
        <h3 id="key-wheel-heading">Circle of fifths</h3>
      </div>
      <div className="fifths-wheel" role="group" aria-label="Circle of fifths root selector">
        {fifths.map((root, index) => {
          const angle = (index / fifths.length) * 360

          return (
            <button
              key={root}
              type="button"
              className={`wheel-key${root === value ? ' is-active' : ''}`}
              aria-pressed={root === value}
              style={{ '--wheel-angle': `${angle}deg` } as CSSProperties}
              onClick={() => {
                onInteract?.()
                onChange(root)
              }}
            >
              {root}
            </button>
          )
        })}
        <div className="wheel-core" aria-hidden="true">
          <span>Fifths</span>
          <strong>{value ?? '—'}</strong>
        </div>
      </div>
    </section>
  )
}
