import { noteNames, voicingNames, type Key, type StudyResult } from '../../music-core'

interface ChordDisplayProps {
  activeKey: Key | null
  result: StudyResult | null
}

export function ChordDisplay({ activeKey, result }: ChordDisplayProps) {
  return (
    <section className="panel chord-display" aria-live="polite" aria-labelledby="chord-display-heading">
      <p className="eyebrow">Now studying</p>
      <h2 id="chord-display-heading">{activeKey ? `${activeKey.root} ${activeKey.tonality}` : 'No key selected'}</h2>
      {result?.kind === 'chord' ? (
        <div className="chord-card">
          <span className="degree-badge">{result.degree}</span>
          <div>
            <p className="chord-name">{result.name}</p>
            <dl className="chord-facts">
              <div>
                <dt>Degree</dt>
                <dd>{result.degree}</dd>
              </div>
              <div>
                <dt>Quality</dt>
                <dd>{result.quality}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{noteNames(result)}</dd>
              </div>
              <div>
                <dt>Inversion</dt>
                <dd>{result.inversion}</dd>
              </div>
              <div>
                <dt>Keyboard voicing</dt>
                <dd>{voicingNames(result)}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : result?.kind === 'keyboard-tone' ? (
        <div className="chord-card">
          <span className="degree-badge">Key</span>
          <div>
            <p className="chord-name">Keyboard tone {result.name}</p>
            <dl className="chord-facts">
              <div>
                <dt>Type</dt>
                <dd>Single note</dd>
              </div>
              <div>
                <dt>Keyboard tone</dt>
                <dd>{voicingNames(result)}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <p className="helper">Choose context, trigger a degree or play any key, then read the chord identity or single keyboard tone.</p>
      )}
    </section>
  )
}
