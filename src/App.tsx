import { useState } from 'react'
import { initAudio, releaseVoicing, startVoicing } from './audio'
import type { ChordResult, DegreeNum, NoteName, Tonality, VoicedNote } from './music-core'
import { findDiatonicDegreeForNote, resolveDiatonicTriad, resolveKeyboardTone, resolveVisibleKeyboardTriad } from './music-core'
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
    void startVoicing({ voicing: chord.voicing }).catch(() => {
      setAudioError('Audio could not start, but visual study mode still works.')
    })
  }

  const triggerKeyboardTone = (note: VoicedNote) => {
    const tone = resolveKeyboardTone(note)
    dispatch({ type: 'triggerKeyboardTone', tone })
    void startVoicing({ voicing: tone.voicing }).catch(() => {
      setAudioError('Audio could not start, but visual study mode still works.')
    })
  }

  const releaseActiveVoicing = () => {
    releaseVoicing()
  }

  const triggerKeyboardKey = (key: VoicedNote) => {
    const degree = activeKey ? findDiatonicDegreeForNote(activeKey, key.note) : null

    if (activeKey && degree) {
      triggerChord(degree, resolveVisibleKeyboardTriad(activeKey, degree, key.octave))
      return
    }

    triggerKeyboardTone(key)
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <h1>Study chords from the keyboard first.</h1>
        <div className="hero-intro">
          <p className="eyebrow">GenChord prototype</p>
          <p>Choose context, trigger a degree or key, identify the chord or tone, then see and hear the exact notes on the instrument.</p>
        </div>
      </section>

      <section className="instrument-stage" aria-labelledby="instrument-heading">
        <div className="instrument-heading">
          <p className="eyebrow">Instrument</p>
          <h2 id="instrument-heading">Keyboard workspace</h2>
          <p className="helper">Active highlights show only the triggered voicing or single key, not every matching pitch class.</p>
        </div>
        <KeyboardViz result={state.activeStudy} guidance={state.guidance} onStartKey={triggerKeyboardKey} onStopKey={releaseActiveVoicing} />
      </section>

      <div className="control-grid" aria-label="Sound and study configuration">
        <KeySelector
          root={state.root}
          tonality={state.tonality}
          onRootChange={(root: NoteName) => dispatch({ type: 'setRoot', root })}
          onTonalityChange={(tonality: Tonality) => dispatch({ type: 'setTonality', tonality })}
          onInteract={warmAudio}
        />
        <DegreeButtons activeKey={activeKey} activeDegree={state.activeDegree} onStart={triggerChord} onStop={releaseActiveVoicing} />
        <ChordDisplay activeKey={activeKey} result={state.activeStudy} />
      </div>

      {audioError && <p className="audio-error" role="status">{audioError}</p>}
    </main>
  )
}
