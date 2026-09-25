import { useEffect } from 'react'
import type { DegreeChordOctave } from '../music-core'

const octaves: DegreeChordOctave[] = [3, 4, 5]

interface OctaveBarProps {
  value: DegreeChordOctave
  onChange: (octave: DegreeChordOctave) => void
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'
}

function nextOctave(current: DegreeChordOctave, direction: -1 | 1): DegreeChordOctave {
  const currentIndex = octaves.indexOf(current)
  const safeIndex = currentIndex === -1 ? 1 : currentIndex
  const nextIndex = (safeIndex + direction + octaves.length) % octaves.length

  return octaves[nextIndex]
}

export function OctaveBar({ value, onChange }: OctaveBarProps) {
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') || isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
      onChange(nextOctave(value, event.key === 'ArrowLeft' ? -1 : 1))
    }

    window.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [onChange, value])

  return (
    <div className="octave-bar" role="group" aria-label="Chord octave" aria-describedby="octave-bar-caption">
      <div className="octave-bar-segments">
        {octaves.map((octave) => (
          <button
            key={octave}
            type="button"
            className={`octave-segment${octave === value ? ' is-active' : ''}`}
            aria-pressed={octave === value}
            aria-label={`Set chord octave ${octave}`}
            onClick={() => onChange(octave)}
          />
        ))}
      </div>
      <span id="octave-bar-caption" className="octave-bar-caption">Octave {value}</span>
    </div>
  )
}
