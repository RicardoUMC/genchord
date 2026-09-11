import { useEffect } from 'react'
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
  onTrigger: (degree: DegreeNum, chord: ChordResult) => void
}

export function DegreeButtons({ activeKey, activeDegree, onTrigger }: DegreeButtonsProps) {
  const triggerDegree = (degree: DegreeNum) => {
    if (!activeKey) {
      return
    }

    onTrigger(degree, resolveDiatonicTriad(activeKey, degree))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const degree = keyboardDegreeByCode.get(event.code)
      if (!degree) {
        return
      }

      event.preventDefault()
      triggerDegree(degree)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeKey, onTrigger])

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
              onClick={() => triggerDegree(degree)}
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
