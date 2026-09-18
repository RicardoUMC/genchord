import type { Mode } from '../../music-core'

interface ModeInfo {
  description: string
  songs: string[]
  progressions: string[]
}

const modeContext: Record<Mode, ModeInfo> = {
  ionian: {
    description: 'The major scale. Bright, stable, and resolved — the foundation of Western harmony.',
    songs: ['"Let It Be" — The Beatles', '"Twist and Shout" — The Beatles', '"Happy" — Pharrell Williams'],
    progressions: ['I — V — vi — IV', 'I — IV — V'],
  },
  dorian: {
    description: 'Minor with a raised 6th. Melancholic but with a touch of hope or light.',
    songs: ['"Scarborough Fair" — Simon & Garfunkel', '"Mad World" — Tears for Fears', '"Eleanor Rigby" — The Beatles'],
    progressions: ['i — IV', 'i — IV — VII'],
  },
  phrygian: {
    description: 'Minor with a lowered 2nd. Dark, tense, and exotic — often feels Spanish or Middle Eastern.',
    songs: ['"White Rabbit" — Jefferson Airplane', '"Army of Me" — Björk'],
    progressions: ['i — bII', 'i — bII — VII'],
  },
  lydian: {
    description: 'Major with a raised 4th. Dreamy, floating, and uplifting — the "sci-fi" major scale.',
    songs: ['"Man on the Moon" — R.E.M.', '"The Simpsons Theme" — Danny Elfman', '"Flying Theme" — E.T.'],
    progressions: ['I — II', 'I — II — vi'],
  },
  mixolydian: {
    description: 'Major with a lowered 7th. Bluesy, relaxed, and open — the sound of rock and folk.',
    songs: ['"Norwegian Wood" — The Beatles', '"Sweet Child O\' Mine" — Guns N\' Roses', '"Hey Jude" — The Beatles'],
    progressions: ['I — IV', 'I — bVII — IV'],
  },
  aeolian: {
    description: 'The natural minor scale. Somber, introspective, and emotionally deep.',
    songs: ['"All Along the Watchtower" — Jimi Hendrix', '"House of the Rising Sun" — The Animals'],
    progressions: ['i — VII', 'i — VI — VII'],
  },
  locrian: {
    description: 'Diminished tonic with a minor 2nd. Unstable, dissonant, and rarely used as a tonal center.',
    songs: ['"Juice" — Lizzo', '"Dust to Dust" — The Chemical Brothers'],
    progressions: ['i° — bII', 'i° — bII — iv'],
  },
}

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

  const info = modeContext[mode]

  return (
    <section className="panel musical-context" aria-labelledby="musical-context-heading">
      <div>
        <p className="eyebrow">Reference</p>
        <h2 id="musical-context-heading">Musical context</h2>
      </div>
      <div className="musical-context-content">
        <p className="mode-description">{info.description}</p>
        <div className="mode-songs">
          <h3>Songs</h3>
          <ul>
            {info.songs.map((song) => (
              <li key={song}>{song}</li>
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
