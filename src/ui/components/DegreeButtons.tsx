import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { ChordResult, DegreeNum, Key } from '../../music-core'
import { resolveDiatonicTriad } from '../../music-core'

const degrees: DegreeNum[] = [1, 2, 3, 4, 5, 6, 7]
const keyboardDegreeByCode = new Map<string, DegreeNum>([
  ['Digit1', 1],
  ['Digit2', 2],
  ['Digit3', 3],
  ['Digit4', 4],
  ['Digit5', 5],
  ['Digit6', 6],
  ['Digit7', 7],
  ['KeyQ', 1],
  ['KeyW', 2],
  ['KeyE', 3],
  ['KeyR', 4],
  ['KeyT', 5],
  ['KeyY', 6],
  ['KeyU', 7],
])

interface DegreeButtonsProps {
  activeKey: Key | null
  activeDegree: DegreeNum | null
  onStart: (degree: DegreeNum, chord: ChordResult) => void
  onStop: () => void
}

export function DegreeButtons({ activeKey, activeDegree, onStart, onStop }: DegreeButtonsProps) {
  const pressedShortcutCodes = useRef(new Set<string>())
  const activeKeyRef = useRef(activeKey)
  const onStartRef = useRef(onStart)
  const onStopRef = useRef(onStop)

  activeKeyRef.current = activeKey
  onStartRef.current = onStart
  onStopRef.current = onStop

  const startDegree = (degree: DegreeNum, key = activeKeyRef.current) => {
    if (!key) {
      return
    }

    onStartRef.current(degree, resolveDiatonicTriad(key, degree))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const degree = keyboardDegreeByCode.get(event.code)
      if (!degree) {
        return
      }

      event.preventDefault()
      if (event.repeat || pressedShortcutCodes.current.has(event.code)) {
        return
      }

      pressedShortcutCodes.current.add(event.code)
      startDegree(degree, activeKeyRef.current)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const degree = keyboardDegreeByCode.get(event.code)
      if (!degree) {
        return
      }

      event.preventDefault()
      pressedShortcutCodes.current.delete(event.code)
      onStopRef.current()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const startButtonFromKeyboard = (event: ReactKeyboardEvent<HTMLButtonElement>, degree: DegreeNum) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    if (!event.repeat) {
      startDegree(degree)
    }
  }

  return (
    <section className="panel" aria-labelledby="degree-heading">
      <div>
        <p className="eyebrow">Degrees</p>
        <h2 id="degree-heading">Trigger a diatonic triad</h2>
      </div>
      <div className="degree-grid">
        {degrees.map((degree) => {
          const chord = activeKey ? resolveDiatonicTriad(activeKey, degree) : null
          const label = chord?.degree ?? String(degree)

          return (
            <button
              key={degree}
              type="button"
              className={activeDegree === degree ? 'is-active' : ''}
              disabled={!activeKey}
              onPointerDown={() => startDegree(degree)}
              onPointerUp={onStop}
              onPointerLeave={onStop}
              onPointerCancel={onStop}
              onKeyDown={(event) => startButtonFromKeyboard(event, degree)}
              onKeyUp={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onStop()
                }
              }}
            >
              <span>{label}</span>
              <small>{degree} / {['Q', 'W', 'E', 'R', 'T', 'Y', 'U'][degree - 1]}</small>
            </button>
          )
        })}
      </div>
      {!activeKey && <p className="helper">Select a root and tonality before triggering chords.</p>}
    </section>
  )
}
