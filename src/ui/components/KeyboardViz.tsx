import type { NoteName, StudyResult, VoicedNote } from '../../music-core'

interface PianoKey {
  note: NoteName
  octave: number
  accidental: boolean
}

const keyboardNotes: PianoKey[] = [
  ...([3, 4, 5] as const).flatMap((octave) =>
    (['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const).map((note) => ({
      note,
      octave,
      accidental: note.includes('#'),
    })),
  ),
  { note: 'C', octave: 6, accidental: false },
]

function enharmonicSet(notes: NoteName[]) {
  const map: Record<string, NoteName> = {
    Db: 'C#',
    Eb: 'D#',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#',
  }

  return new Set(notes.map((note) => map[note] ?? note))
}

function voicedKeyId({ note, octave }: VoicedNote) {
  const [normalizedNote] = enharmonicSet([note])
  return `${normalizedNote}${octave}`
}

interface KeyboardVizProps {
  activeInput: StudyResult | null
  guidance: string | null
  onStartKey: (key: VoicedNote) => void
  onStopKey: () => void
}

export function KeyboardViz({ activeInput, guidance, onStartKey, onStopKey }: KeyboardVizProps) {
  const activeVoicing = new Set((activeInput?.voicing ?? []).map(voicedKeyId))
  const generatorKey = activeInput ? voicedKeyId(activeInput.generatorNote) : null

  return (
    <section className="keyboard-panel" aria-labelledby="keyboard-heading">
      <div>
        <p className="eyebrow">Keyboard</p>
        <h2 id="keyboard-heading">Exact voicing C3-C6</h2>
      </div>
      <div className="keyboard" role="group" aria-label="Playable piano keyboard from C3 to C6">
        {keyboardNotes.map((key) => {
          const keyId = `${key.note}${key.octave}`
          const active = activeVoicing.has(keyId)
          const generator = generatorKey === keyId
          return (
            <button
              key={keyId}
              type="button"
              className={`piano-key ${key.accidental ? 'black-key' : 'white-key'} ${active ? 'is-active' : ''} ${generator ? 'is-generator' : ''}`}
              data-testid={generator ? 'generator-piano-key' : active ? 'active-piano-key' : undefined}
              onPointerDown={() => onStartKey({ note: key.note, octave: key.octave })}
              onPointerUp={onStopKey}
              onPointerLeave={onStopKey}
              onPointerCancel={onStopKey}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') {
                  return
                }

                event.preventDefault()
                if (!event.repeat) {
                  onStartKey({ note: key.note, octave: key.octave })
                }
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onStopKey()
                }
              }}
              aria-label={`${key.note}${key.octave}${generator ? ' generator note' : active ? ' chord tone' : ''}${active ? ' pressed' : ''}`}
            >
              {!key.accidental && `${key.note}${key.octave}`}
              {generator && <span className={`source-marker ${key.accidental ? 'source-marker-on-black' : 'source-marker-on-white'}`} aria-hidden="true">●</span>}
            </button>
          )
        })}
      </div>
      {guidance && <p className="helper keyboard-guidance" role="status">{guidance}</p>}
    </section>
  )
}
