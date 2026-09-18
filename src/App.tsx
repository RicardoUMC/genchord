import { useEffect, useState } from 'react'
import { initAudio, installAudioWarmup, releaseAllVoicings, releaseVoicing, startVoicing } from './audio'
import type { ChordResult, DegreeNum, Mode, NoteName, VoicedNote } from './music-core'
import { buildScale, findDiatonicDegreeForNote, resolveDiatonicTriad, resolveKeyboardTone, resolveVisibleKeyboardTriad } from './music-core'
import type { ScaleGuideStyle } from './ui/state'
import { ChordDisplay, DegreeButtons, KeyboardViz, KeySelector, MusicalContext, useStudyState } from './ui'

export default function App() {
  const { state, activeKey, dispatch } = useStudyState()
  const [audioError, setAudioError] = useState<string | null>(null)
  const scaleNotes = activeKey ? buildScale(activeKey) : null

  const warmAudio = () => {
    void initAudio().catch(() => {
      setAudioError('Audio unavailable; visual mode still works.')
    })
  }

  useEffect(() => {
    const uninstallAudioWarmup = installAudioWarmup()
    const stopHeldInputs = () => {
      releaseAllVoicings()
      dispatch({ type: 'releaseAllInputs' })
    }

    window.addEventListener('blur', stopHeldInputs)

    return () => {
      uninstallAudioWarmup()
      window.removeEventListener('blur', stopHeldInputs)
    }
  }, [dispatch])

  useEffect(() => {
    const toggleAutoChords = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditableTarget = target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.tagName === 'TEXTAREA'

      if (event.code !== 'KeyA' || event.repeat || isEditableTarget) {
        return
      }

      event.preventDefault()
      dispatch({ type: 'toggleAutoChords' })
    }

    window.addEventListener('keydown', toggleAutoChords)

    return () => {
      window.removeEventListener('keydown', toggleAutoChords)
    }
  }, [dispatch])

  const triggerChord = (triggerId: string, degree: DegreeNum, chord: ChordResult) => {
    if (!state.autoChordsEnabled) {
      triggerKeyboardTone(triggerId, chord.generatorNote)
      return
    }

    dispatch({ type: 'triggerChord', triggerId, degree, chord })
    void startVoicing({ triggerId, voicing: chord.voicing }).catch(() => {
      setAudioError('Audio unavailable; visual mode still works.')
    })
  }

  const triggerKeyboardTone = (triggerId: string, note: VoicedNote) => {
    const tone = resolveKeyboardTone(note)
    dispatch({ type: 'triggerKeyboardTone', triggerId, tone })
    void startVoicing({ triggerId, voicing: tone.voicing }).catch(() => {
      setAudioError('Audio unavailable; visual mode still works.')
    })
  }

  const releaseHeldVoicing = (triggerId: string) => {
    releaseVoicing(triggerId)
    dispatch({ type: 'releaseHeldInput', triggerId })
  }

  const changeRoot = (root: NoteName) => {
    releaseAllVoicings()
    dispatch({ type: 'setRoot', root })
  }

  const changeMode = (mode: Mode) => {
    releaseAllVoicings()
    dispatch({ type: 'setMode', mode })
  }

  const triggerKeyboardKey = (triggerId: string, key: VoicedNote) => {
    const degree = activeKey ? findDiatonicDegreeForNote(activeKey, key.note) : null

    if (activeKey && degree && state.autoChordsEnabled) {
      triggerChord(triggerId, degree, resolveVisibleKeyboardTriad(activeKey, degree, key.octave))
      return
    }

    triggerKeyboardTone(triggerId, key)
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

      <section className="instrument-stage" aria-labelledby="chord-display-heading">
        <ChordDisplay activeKey={activeKey} result={state.activeStudy} autoChordsEnabled={state.autoChordsEnabled} />
        <div className="instrument-toolbar">
          <div className="instrument-status-slot">
            {audioError ? <p className="audio-error" role="alert">{audioError}</p> : <span aria-hidden="true" />}
          </div>
          <label className="field scale-guide-field">
            Scale guide style
            <select
              value={state.scaleGuideStyle}
              onChange={(event) => dispatch({ type: 'setScaleGuideStyle', scaleGuideStyle: event.target.value as ScaleGuideStyle })}
            >
              <option value="dim">Dim out-of-scale keys</option>
              <option value="highlight">Highlight in-scale keys</option>
            </select>
          </label>
        </div>
        <KeyboardViz activeInputs={Object.values(state.activeInputs)} guidance={state.guidance} scaleNotes={scaleNotes} scaleGuideStyle={state.scaleGuideStyle} onStartKey={triggerKeyboardKey} onStopKey={releaseHeldVoicing} />
      </section>

      <div className="control-grid" aria-label="Sound and study configuration">
        <KeySelector
          root={state.root}
          mode={state.mode}
          onRootChange={changeRoot}
          onModeChange={changeMode}
          onInteract={warmAudio}
        />
        <DegreeButtons activeKey={activeKey} activeDegree={state.activeDegree} onStart={triggerChord} onStop={releaseHeldVoicing} />
        <section className="panel" aria-labelledby="auto-chords-heading">
          <div>
            <p className="eyebrow">Playback</p>
            <h2 id="auto-chords-heading">Automatic chords</h2>
          </div>
          <button type="button" className="auto-chords-toggle" aria-pressed={state.autoChordsEnabled} onClick={() => dispatch({ type: 'toggleAutoChords' })}>
            Auto chords: {state.autoChordsEnabled ? 'On' : 'Off'}
          </button>
          <p className="helper">Shortcut: A. When off, degree buttons, degree shortcuts, and keyboard keys play only the selected note.</p>
        </section>
      </div>

      <MusicalContext mode={state.mode} />
    </main>
  )
}
