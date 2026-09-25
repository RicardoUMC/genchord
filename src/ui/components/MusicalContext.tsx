import { getModeContext } from '../../music-core'
import type { Mode } from '../../music-core'

interface MusicalContextProps {
  mode: Mode | null
}

export function MusicalContext({ mode }: MusicalContextProps) {
  if (!mode) {
    return (
      <section className="panel musical-context" aria-labelledby="musical-context-heading">
        <div>
          <p className="eyebrow">Reference</p>
          <h2 id="musical-context-heading">Musical context</h2>
        </div>
        <p className="helper">Select a scale and mode to see its character, popular songs, and suggested progressions.</p>
      </section>
    )
  }

  const info = getModeContext(mode)

  return (
    <section className="panel musical-context" aria-labelledby="musical-context-heading">
      <div>
        <p className="eyebrow">Reference</p>
        <h2 id="musical-context-heading">Musical context</h2>
      </div>
      <div className="musical-context-content">
        <p className="mode-description">{info.description}</p>
        <p className="helper"><strong>Characteristic note:</strong> {info.characteristicNote}</p>
        <div className="mode-songs">
          <h3>Songs</h3>
          <ul>
            {info.examples.map((example) => (
              <li key={`${example.song}-${example.artist}`}>{example.song} — {example.artist}</li>
            ))}
          </ul>
        </div>
        <div className="mode-progressions">
          <h3>Progressions</h3>
          <ul>
            {info.progressions.map((progression) => (
              <li key={progression}><code>{progression}</code></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
