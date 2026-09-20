import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { ChordResult, DegreeNum, Key, TriadInversion } from '../../music-core'
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

function isEditableTarget(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null

  return element?.isContentEditable || element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA'
}

interface DegreeButtonsProps {
  className?: string
  activeKey: Key | null
  activeDegree: DegreeNum | null
  inversion: TriadInversion
  onStart: (triggerId: string, degree: DegreeNum, chord: ChordResult) => void
  onStop: (triggerId: string) => void
}

export function DegreeButtons({ className, activeKey, activeDegree, inversion, onStart, onStop }: DegreeButtonsProps) {
  const pressedShortcutCodes = useRef(new Set<string>())
  const activeKeyRef = useRef(activeKey)
  const inversionRef = useRef(inversion)
  const onStartRef = useRef(onStart)
  const onStopRef = useRef(onStop)

  activeKeyRef.current = activeKey
  inversionRef.current = inversion
  onStartRef.current = onStart
  onStopRef.current = onStop

  const startDegree = (triggerId: string, degree: DegreeNum, key = activeKeyRef.current) => {
    if (!key) {
      return
    }

    onStartRef.current(triggerId, degree, resolveDiatonicTriad(key, degree, 4, inversionRef.current))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const degree = keyboardDegreeByCode.get(event.code)
      if (!degree || isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
      if (event.repeat || pressedShortcutCodes.current.has(event.code)) {
        return
      }

      pressedShortcutCodes.current.add(event.code)
      startDegree(`degree:shortcut:${event.code}`, degree, activeKeyRef.current)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const degree = keyboardDegreeByCode.get(event.code)
      if (!degree) {
        return
      }

      const wasPressedShortcut = pressedShortcutCodes.current.delete(event.code)
      if (!wasPressedShortcut && isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
      if (wasPressedShortcut) {
        onStopRef.current(`degree:shortcut:${event.code}`)
      }
    }

    const onWindowBlur = () => {
      pressedShortcutCodes.current.clear()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onWindowBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [])

  const startButtonFromKeyboard = (event: ReactKeyboardEvent<HTMLButtonElement>, degree: DegreeNum) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    if (!event.repeat) {
      startDegree(`degree:button-key:${degree}`, degree)
    }
  }

  const pointerTriggerId = (degree: DegreeNum) => `degree:pointer:${degree}`

  return (
    <section className={`panel degree-panel${className ? ` ${className}` : ''}`} aria-labelledby="degree-heading">
      <div>
        <p className="eyebrow">Degrees</p>
        <h2 id="degree-heading">Trigger a diatonic triad</h2>
      </div>
      <div className="degree-grid">
        {degrees.map((degree) => {
          const chord = activeKey ? resolveDiatonicTriad(activeKey, degree, 4, inversion) : null
          const label = chord?.degree ?? String(degree)

          return (
            <button
              key={degree}
              type="button"
              className={activeDegree === degree ? 'is-active' : ''}
              disabled={!activeKey}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture?.(event.pointerId)
                startDegree(pointerTriggerId(degree), degree)
              }}
              onPointerUp={() => onStop(pointerTriggerId(degree))}
              onPointerLeave={() => onStop(pointerTriggerId(degree))}
              onPointerCancel={() => onStop(pointerTriggerId(degree))}
              onKeyDown={(event) => startButtonFromKeyboard(event, degree)}
              onKeyUp={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onStop(`degree:button-key:${degree}`)
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
