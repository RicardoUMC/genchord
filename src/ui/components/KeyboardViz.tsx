import type { ChordResult, NoteName } from '../../music-core'

interface PianoKey {
  note: NoteName
  octave: number
  accidental: boolean
}

const keyboardNotes: PianoKey[] = [
  ...(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const).map((note) => ({
    note,
    octave: 3,
    accidental: note.includes('#'),
  })),
  ...(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const).map((note) => ({
    note,
    octave: 4,
    accidental: note.includes('#'),
  })),
  { note: 'C', octave: 5, accidental: false },
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

export function KeyboardViz({ chord }: { chord: ChordResult | null }) {
  const activeNotes = enharmonicSet(chord?.notes ?? [])

  return (
    <section className="panel keyboard-panel" aria-labelledby="keyboard-heading">
      <div>
        <p className="eyebrow">Keyboard</p>
        <h2 id="keyboard-heading">Chord tones C3-C5</h2>
      </div>
      <div className="keyboard" role="img" aria-label="Piano keyboard with active chord tones highlighted">
        {keyboardNotes.map((key) => {
          const active = activeNotes.has(key.note)
          return (
            <span
              key={`${key.note}${key.octave}`}
              className={`piano-key ${key.accidental ? 'black-key' : 'white-key'} ${active ? 'is-active' : ''}`}
              data-testid={active ? 'active-piano-key' : undefined}
              aria-label={`${key.note}${key.octave}${active ? ' active' : ''}`}
            >
              {!key.accidental && `${key.note}${key.octave}`}
            </span>
          )
        })}
      </div>
    </section>
  )
}
