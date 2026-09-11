import { noteNames, type ChordResult, type Key } from '../../music-core'

interface ChordDisplayProps {
  activeKey: Key | null
  chord: ChordResult | null
}

export function ChordDisplay({ activeKey, chord }: ChordDisplayProps) {
  return (
    <section className="panel chord-display" aria-live="polite" aria-labelledby="chord-display-heading">
      <p className="eyebrow">Now studying</p>
      <h2 id="chord-display-heading">{activeKey ? `${activeKey.root} ${activeKey.tonality}` : 'No key selected'}</h2>
      {chord ? (
        <div className="chord-card">
          <span className="degree-badge">{chord.degree}</span>
          <div>
            <p className="chord-name">{chord.name}</p>
            <p className="note-list">{noteNames(chord)}</p>
          </div>
        </div>
      ) : (
        <p className="helper">Trigger a degree to see chord name, degree, and notes.</p>
      )}
    </section>
  )
}
