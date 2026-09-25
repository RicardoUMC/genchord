import { getDiatonicChords, getModeContext } from '../music-core'
import type { Mode, NoteName } from '../music-core'

interface MusicalContextPanelProps {
  root: NoteName | null
  mode: Mode | null
  expanded: boolean
}

export function MusicalContextPanel({ root, mode, expanded }: MusicalContextPanelProps) {
  if (!expanded) {
    return null
  }

  if (!root || !mode) {
    return (
      <section id="musical-context-panel" className="panel musical-context" aria-labelledby="musical-context-panel-heading">
        <div>
          <p className="eyebrow">Reference</p>
          <h2 id="musical-context-panel-heading">Musical context</h2>
        </div>
        <p className="helper">Choose a root note and scale/mode to see its color notes, examples, progressions, and diatonic chords.</p>
      </section>
    )
  }

  const context = getModeContext(mode)
  const chords = getDiatonicChords(root, mode)

  return (
    <section id="musical-context-panel" className="panel musical-context" aria-labelledby="musical-context-panel-heading">
      <div>
        <p className="eyebrow">Reference</p>
        <h2 id="musical-context-panel-heading">Musical context</h2>
      </div>

      <article aria-labelledby="mode-context-heading">
        <h3 id="mode-context-heading">{root} {context.name}</h3>
        <p>{context.description}</p>
        <p><strong>Characteristic note:</strong> {context.characteristicNote}</p>
      </article>

      <div className="study-pills" aria-label="Typical progressions">
        {context.progressions.map((progression) => (
          <span key={progression}>{progression}</span>
        ))}
      </div>

      <div className="control-grid">
        <section aria-labelledby="mode-examples-heading">
          <h3 id="mode-examples-heading">Famous examples</h3>
          <ul>
            {context.examples.map((example) => (
              <li key={`${example.song}-${example.artist}`}>{example.song} — {example.artist}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="diatonic-chords-heading">
          <h3 id="diatonic-chords-heading">Diatonic chords in {root} {context.name}</h3>
          <ol>
            {chords.map((chord) => (
              <li key={chord.degreeNum}>
                <strong>{chord.degree}</strong> {chord.name} <span className="helper">({chord.notes.join(' · ')})</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  )
}
