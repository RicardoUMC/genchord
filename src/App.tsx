import { useState } from 'react'
import { initAudio, playChord } from './audio'
import type { ChordResult, DegreeNum, NoteName, Tonality } from './music-core'
import { ChordDisplay, DegreeButtons, KeyboardViz, KeySelector, useStudyState } from './ui'

export default function App() {
  const { state, activeKey, dispatch } = useStudyState()
  const [audioError, setAudioError] = useState<string | null>(null)

  const warmAudio = () => {
    void initAudio().catch(() => {
      setAudioError('Audio could not start, but visual study mode still works.')
    })
  }

  const triggerChord = (degree: DegreeNum, chord: ChordResult) => {
    dispatch({ type: 'triggerChord', degree, chord })
    void playChord({ notes: chord.notes, octave: 4 }).catch(() => {
      setAudioError('Audio could not start, but visual study mode still works.')
    })
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">GenChord prototype</p>
        <h1>Pick a key, trigger a degree, see and hear the chord.</h1>
        <p>Start with major/minor triads by scale degree. Physical keys 1-7 or Q-U mirror the degree buttons.</p>
      </section>

      <div className="study-grid">
        <KeySelector
          root={state.root}
          tonality={state.tonality}
          onRootChange={(root: NoteName) => dispatch({ type: 'setRoot', root })}
          onTonalityChange={(tonality: Tonality) => dispatch({ type: 'setTonality', tonality })}
          onInteract={warmAudio}
        />
        <ChordDisplay activeKey={activeKey} chord={state.activeChord} />
      </div>

      <DegreeButtons activeKey={activeKey} activeDegree={state.activeDegree} onTrigger={triggerChord} />
      <KeyboardViz chord={state.activeChord} />
      {audioError && <p className="audio-error" role="status">{audioError}</p>}
    </main>
  )
}
