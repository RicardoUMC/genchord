import { useCallback, useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import type { NoteName, StudyResult, VoicedNote } from '../../music-core'
import type { ScaleGuideStyle } from '../state'

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
  activeInputs: StudyResult[]
  guidance: string | null
  scaleNotes: NoteName[] | null
  scaleGuideStyle: ScaleGuideStyle
  onStartKey: (triggerId: string, key: VoicedNote) => void
  onStopKey: (triggerId: string) => void
}

export function KeyboardViz({ activeInputs, guidance, scaleNotes, scaleGuideStyle, onStartKey, onStopKey }: KeyboardVizProps) {
  const activeVoicing = new Set(activeInputs.flatMap((activeInput) => activeInput.voicing.map(voicedKeyId)))
  const generatorKeys = new Set(activeInputs.map((activeInput) => voicedKeyId(activeInput.generatorNote)))
  const inScaleNotes = scaleNotes ? enharmonicSet(scaleNotes) : null
  const activePointersRef = useRef(new Map<number, { keyId: string | null; triggerId: string | null }>())
  const onStopKeyRef = useRef(onStopKey)
  const suppressNextClickRef = useRef(false)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickTriggerRef = useRef<string | null>(null)

  onStopKeyRef.current = onStopKey

  const stopPointerPlayback = useCallback((pointerId: number) => {
    const activePointer = activePointersRef.current.get(pointerId)
    const triggerId = activePointer?.triggerId

    activePointersRef.current.delete(pointerId)

    if (triggerId) {
      onStopKeyRef.current(triggerId)
    }
  }, [])

  useEffect(() => {
    const stopActivePointer = (event: globalThis.PointerEvent) => {
      stopPointerPlayback(event.pointerId)
    }

    window.addEventListener('pointerup', stopActivePointer)
    window.addEventListener('pointercancel', stopActivePointer)

    return () => {
      window.removeEventListener('pointerup', stopActivePointer)
      window.removeEventListener('pointercancel', stopActivePointer)

      for (const { triggerId } of activePointersRef.current.values()) {
        if (triggerId) {
          onStopKeyRef.current(triggerId)
        }
      }

      activePointersRef.current.clear()

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }

      if (clickTriggerRef.current) {
        onStopKeyRef.current(clickTriggerRef.current)
        clickTriggerRef.current = null
      }
    }
  }, [stopPointerPlayback])

  function startPointerKey(event: PointerEvent<HTMLButtonElement>, key: PianoKey, keyId: string) {
    const triggerId = `keyboard:pointer:${event.pointerId}:${keyId}`

    suppressNextClickRef.current = true
    stopPointerPlayback(event.pointerId)
    activePointersRef.current.set(event.pointerId, { keyId, triggerId })
    onStartKey(triggerId, { note: key.note, octave: key.octave })
  }

  function activateClickedKey(key: PianoKey, keyId: string) {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }

    if (clickTriggerRef.current) {
      onStopKey(clickTriggerRef.current)
      clickTriggerRef.current = null
    }

    const triggerId = `keyboard:click:${keyId}`
    clickTriggerRef.current = triggerId
    onStartKey(triggerId, { note: key.note, octave: key.octave })

    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null
      clickTriggerRef.current = null
      onStopKey(triggerId)
    }, 350)
  }

  function enterPointerKey(event: PointerEvent<HTMLButtonElement>, key: PianoKey, keyId: string) {
    const activePointer = activePointersRef.current.get(event.pointerId)

    if (!activePointer || event.buttons === 0 || activePointer.keyId === keyId) {
      return
    }

    if (activePointer.triggerId) {
      onStopKeyRef.current(activePointer.triggerId)
    }

    const triggerId = `keyboard:pointer:${event.pointerId}:${keyId}`
    activePointersRef.current.set(event.pointerId, { keyId, triggerId })
    onStartKey(triggerId, { note: key.note, octave: key.octave })
  }

  function leavePointerKey(event: PointerEvent<HTMLButtonElement>, keyId: string) {
    const activePointer = activePointersRef.current.get(event.pointerId)

    if (!activePointer) {
      return
    }

    if (activePointer.keyId === keyId) {
      activePointer.keyId = null
    }

    if (activePointer.triggerId) {
      onStopKeyRef.current(activePointer.triggerId)
      activePointer.triggerId = null
    }
  }

  function renderKey(key: PianoKey) {
    const keyId = `${key.note}${key.octave}`
    const active = activeVoicing.has(keyId)
    const generator = generatorKeys.has(keyId)
    const outOfScale = inScaleNotes !== null && !inScaleNotes.has(key.note)
    const dimmedOutOfScale = scaleGuideStyle === 'dim' && outOfScale

    return (
      <button
        key={keyId}
        type="button"
        className={`piano-key ${key.accidental ? 'black-key' : 'white-key'} ${outOfScale ? 'is-out-of-scale' : ''} ${dimmedOutOfScale ? 'is-scale-dimmed' : ''} ${active ? 'is-active' : ''} ${generator ? 'is-generator' : ''}`}
        style={key.accidental ? blackKeyStyle(key.note) : undefined}
        data-scale-membership={outOfScale ? 'out' : inScaleNotes ? 'in' : undefined}
        data-testid={generator ? 'generator-piano-key' : active ? 'active-piano-key' : undefined}
        onPointerDown={(event) => startPointerKey(event, key, keyId)}
        onPointerEnter={(event) => enterPointerKey(event, key, keyId)}
        onPointerUp={(event) => stopPointerPlayback(event.pointerId)}
        onPointerLeave={(event) => leavePointerKey(event, keyId)}
        onPointerCancel={(event) => stopPointerPlayback(event.pointerId)}
        onClick={() => activateClickedKey(key, keyId)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return
          }

          event.preventDefault()
          if (!event.repeat) {
            onStartKey(`keyboard:key:${keyId}`, { note: key.note, octave: key.octave })
          }
        }}
        onKeyUp={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onStopKey(`keyboard:key:${keyId}`)
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
    <section className="keyboard-panel" aria-label="Keyboard workspace">
      <div className="keyboard" role="group" aria-label="Playable piano keyboard from C3 to C6" data-scale-guide-style={scaleGuideStyle}>
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
