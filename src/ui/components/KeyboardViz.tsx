import { useCallback, useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
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

const keyboardRegisters = [
  keyboardNotes.filter((key) => key.octave === 3),
  keyboardNotes.filter((key) => key.octave === 4),
  keyboardNotes.filter((key) => key.octave === 5),
  keyboardNotes.filter((key) => key.octave === 6),
]

function registerLabel(register: PianoKey[]) {
  const first = register[0]
  const last = register[register.length - 1]

  return `Register ${first.note}${first.octave} to ${last.note}${last.octave}`
}

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

const blackKeyLeftByNote: Partial<Record<NoteName, number>> = {
  'C#': 0.72,
  'D#': 1.72,
  'F#': 3.72,
  'G#': 4.72,
  'A#': 5.72,
}

function blackKeyStyle(note: NoteName): CSSProperties {
  const left = blackKeyLeftByNote[note]

  return {
    '--black-key-left': `calc(var(--white-key-width) * ${left ?? 0})`,
  } as CSSProperties
}

interface KeyboardVizProps {
  activeInput: StudyResult | null
  guidance: string | null
  scaleNotes: NoteName[] | null
  onStartKey: (key: VoicedNote) => void
  onStopKey: () => void
}

export function KeyboardViz({ activeInput, guidance, scaleNotes, onStartKey, onStopKey }: KeyboardVizProps) {
  const activeVoicing = new Set((activeInput?.voicing ?? []).map(voicedKeyId))
  const generatorKey = activeInput ? voicedKeyId(activeInput.generatorNote) : null
  const inScaleNotes = scaleNotes ? enharmonicSet(scaleNotes) : null
  const activePointerIdRef = useRef<number | null>(null)
  const activePointerKeyIdRef = useRef<string | null>(null)

  const clearActivePointer = useCallback(() => {
    activePointerIdRef.current = null
    activePointerKeyIdRef.current = null
  }, [])

  const stopPointerPlayback = useCallback(() => {
    clearActivePointer()
    onStopKey()
  }, [clearActivePointer, onStopKey])

  useEffect(() => {
    const stopActivePointer = () => {
      if (activePointerIdRef.current === null) {
        return
      }

      stopPointerPlayback()
    }

    window.addEventListener('pointerup', stopActivePointer)
    window.addEventListener('pointercancel', stopActivePointer)

    return () => {
      window.removeEventListener('pointerup', stopActivePointer)
      window.removeEventListener('pointercancel', stopActivePointer)
    }
  }, [stopPointerPlayback])

  function startPointerKey(event: PointerEvent<HTMLButtonElement>, key: PianoKey, keyId: string) {
    activePointerIdRef.current = event.pointerId
    activePointerKeyIdRef.current = keyId
    onStartKey({ note: key.note, octave: key.octave })
  }

  function enterPointerKey(event: PointerEvent<HTMLButtonElement>, key: PianoKey, keyId: string) {
    if (activePointerIdRef.current !== event.pointerId || event.buttons === 0 || activePointerKeyIdRef.current === keyId) {
      return
    }

    activePointerKeyIdRef.current = keyId
    onStartKey({ note: key.note, octave: key.octave })
  }

  function leavePointerKey(event: PointerEvent<HTMLButtonElement>, keyId: string) {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }

    if (activePointerKeyIdRef.current === keyId) {
      activePointerKeyIdRef.current = null
    }

    onStopKey()
  }

  function renderKey(key: PianoKey) {
    const keyId = `${key.note}${key.octave}`
    const active = activeVoicing.has(keyId)
    const generator = generatorKey === keyId
    const outOfScale = inScaleNotes !== null && !inScaleNotes.has(key.note)

    return (
      <button
        key={keyId}
        type="button"
        className={`piano-key ${key.accidental ? 'black-key' : 'white-key'} ${outOfScale ? 'is-out-of-scale' : ''} ${active ? 'is-active' : ''} ${generator ? 'is-generator' : ''}`}
        style={key.accidental ? blackKeyStyle(key.note) : undefined}
        data-scale-membership={outOfScale ? 'out' : inScaleNotes ? 'in' : undefined}
        data-testid={generator ? 'generator-piano-key' : active ? 'active-piano-key' : undefined}
        onPointerDown={(event) => startPointerKey(event, key, keyId)}
        onPointerEnter={(event) => enterPointerKey(event, key, keyId)}
        onPointerUp={stopPointerPlayback}
        onPointerLeave={(event) => leavePointerKey(event, keyId)}
        onPointerCancel={stopPointerPlayback}
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
  }

  return (
    <section className="keyboard-panel" aria-labelledby="keyboard-heading">
      <div>
        <p className="eyebrow">Keyboard</p>
        <h2 id="keyboard-heading">Exact voicing C3-C6</h2>
      </div>
      <div className="keyboard" role="group" aria-label="Playable piano keyboard from C3 to C6">
        {keyboardRegisters.map((register) => (
          <div className="keyboard-register" role="group" aria-label={registerLabel(register)} key={registerLabel(register)}>
            <div className="white-key-row">
              {register.filter((key) => !key.accidental).map(renderKey)}
            </div>
            <div className="black-key-layer">
              {register.filter((key) => key.accidental).map(renderKey)}
            </div>
          </div>
        ))}
      </div>
      {guidance && <p className="helper keyboard-guidance" role="status">{guidance}</p>}
    </section>
  )
}
