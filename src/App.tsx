import { useEffect, useState } from 'react'
import { initAudio, installAudioWarmup, prepareAudioInstruments, releaseAllVoicings, releaseVoicing, startVoicing } from './audio'
import type { ChordResult, DegreeChordOctave, DegreeNum, Mode, NoteName, TriadInversion, VoicedNote } from './music-core'
import { buildScale, findDiatonicDegreeForNote, resolveKeyboardTone, resolveVisibleKeyboardTriad } from './music-core'
import type { ScaleGuideStyle } from './ui/state'
import { ChordDisplay, DegreeButtons, KeyboardViz, KeySelector, useStudyState } from './ui'
import { MusicalContextPanel } from './ui/MusicalContextPanel'
import { MusicalContextToggle } from './ui/MusicalContextToggle'

export default function App() {
  const { state, activeKey, dispatch } = useStudyState()
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isMusicalContextOpen, setIsMusicalContextOpen] = useState(false)
  const scaleNotes = activeKey ? buildScale(activeKey) : null

  const warmAudio = () => {
    void initAudio().catch(() => {
      setAudioError('Audio unavailable; visual mode still works.')
    })
  }

  useEffect(() => {
    prepareAudioInstruments()
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

  const changeInversion = (inversion: TriadInversion) => {
    releaseAllVoicings()
    dispatch({ type: 'setInversion', inversion })
  }

  const changeDegreeChordOctave = (degreeChordOctave: DegreeChordOctave) => {
    releaseAllVoicings()
    dispatch({ type: 'setDegreeChordOctave', degreeChordOctave })
  }

  const triggerKeyboardKey = (triggerId: string, key: VoicedNote) => {
    const degree = activeKey ? findDiatonicDegreeForNote(activeKey, key.note) : null

    if (activeKey && degree && state.autoChordsEnabled) {
      triggerChord(triggerId, degree, resolveVisibleKeyboardTriad(activeKey, degree, key, state.inversion))
      return
    }

    triggerKeyboardTone(triggerId, key)
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <h1>Study chords from the keyboard first.</h1>
        <div className="hero-intro">
          <p className="eyebrow">Interactive study tool</p>
          <p>Choose context, trigger a degree or key, identify the chord or tone, then see and hear the exact notes on the instrument.</p>
        </div>
      </section>

      <section className="instrument-stage" aria-labelledby="chord-display-heading">
        <ChordDisplay activeKey={activeKey} result={state.activeStudy} autoChordsEnabled={state.autoChordsEnabled} />
        <div className="instrument-toolbar">
          <DegreeButtons className="instrument-degree-panel" activeKey={activeKey} activeDegrees={state.activeDegrees} inversion={state.inversion} degreeChordOctave={state.degreeChordOctave} onStart={triggerChord} onStop={releaseHeldVoicing} />
          <div className="instrument-options">
            {audioError && <p className="audio-error instrument-status-slot" role="alert">{audioError}</p>}
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
            <label className="field inversion-field">
              Triad inversion
              <select
                value={state.inversion}
                onChange={(event) => changeInversion(event.target.value as TriadInversion)}
              >
                <option value="root">Root position</option>
                <option value="first">First inversion</option>
                <option value="second">Second inversion</option>
              </select>
            </label>
            <label className="field degree-register-field">
              Chord octave
              <select
                value={state.degreeChordOctave}
                onChange={(event) => changeDegreeChordOctave(Number(event.target.value) as DegreeChordOctave)}
              >
                <option value={3}>Octave 3</option>
                <option value={4}>Octave 4</option>
                <option value={5}>Octave 5</option>
              </select>
            </label>
          </div>
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
        <section className="panel" aria-labelledby="scale-color-heading">
          <div>
            <p className="eyebrow">Reference</p>
            <h2 id="scale-color-heading">Scale color</h2>
          </div>
          <MusicalContextToggle
            expanded={isMusicalContextOpen}
            disabled={!state.root || !state.mode}
            onToggle={() => setIsMusicalContextOpen((expanded) => !expanded)}
          />
          <p className="helper">Open a compact reference for color notes, examples, progressions, and the current key's diatonic chords.</p>
        </section>
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

      <MusicalContextPanel root={state.root} mode={state.mode} expanded={isMusicalContextOpen} />
    </main>
  )
}
