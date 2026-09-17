import { noteNames, voicingNames, type Key, type StudyResult } from '../../music-core'

interface ChordDisplayProps {
  activeKey: Key | null
  result: StudyResult | null
  autoChordsEnabled: boolean
}

export function ChordDisplay({ activeKey, result, autoChordsEnabled }: ChordDisplayProps) {
  return (
    <section className="now-studying" aria-labelledby="chord-display-heading">
      <div className="study-summary">
        <div>
          <p className="eyebrow">Now studying</p>
          <h2 id="chord-display-heading">{activeKey ? `${activeKey.root} ${activeKey.tonality}` : 'No key selected'}</h2>
        </div>
        <div className="study-pills" aria-label="Study status">
          <span>{autoChordsEnabled ? 'Auto chords on' : 'Single notes only'}</span>
          <span>Keyboard C3-C6</span>
        </div>
      </div>
      <div className="study-result" aria-live="polite" aria-atomic="true">
        {result?.kind === 'chord' ? (
          <div className="chord-card">
            <span className="degree-badge">{result.degree}</span>
            <div className="result-body">
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
              <p className="helper helper-slot" aria-hidden="true" />
            </div>
          </div>
        ) : result?.kind === 'keyboard-tone' ? (
          <div className="chord-card">
            <span className="degree-badge">Key</span>
            <div className="result-body">
              <p className="chord-name">Keyboard tone {result.name}</p>
              <dl className="chord-facts chord-facts-compact">
                <div>
                  <dt>Type</dt>
                  <dd>Single note</dd>
                </div>
                <div>
                  <dt>Keyboard tone</dt>
                  <dd>{voicingNames(result)}</dd>
                </div>
              </dl>
              <p className="helper helper-slot" aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="chord-card chord-card-empty">
            <span className="degree-badge" aria-hidden="true">–</span>
            <div className="result-body">
              <p className="chord-name">Ready to study</p>
              <p className="helper empty-state-copy">Choose context, trigger a degree or play any key, then read the chord identity or single keyboard tone.</p>
              <p className="helper helper-slot" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
