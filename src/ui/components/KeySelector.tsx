import type { NoteName, Tonality } from '../../music-core'

const rootNotes: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

interface KeySelectorProps {
  root: NoteName | null
  tonality: Tonality | null
  onRootChange: (root: NoteName) => void
  onTonalityChange: (tonality: Tonality) => void
  onInteract: () => void
}

export function KeySelector({ root, tonality, onRootChange, onTonalityChange, onInteract }: KeySelectorProps) {
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
      <div className="tonality-toggle" aria-label="Tonality">
        {(['major', 'minor'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={tonality === value ? 'is-active' : ''}
            disabled={!root}
            onClick={() => {
              onInteract()
              onTonalityChange(value)
            }}
          >
            {value}
          </button>
        ))}
      </div>
    </section>
  )
}
