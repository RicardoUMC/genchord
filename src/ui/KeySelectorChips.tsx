import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { NoteName } from '../music-core'

const chromaticRoots: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const circleRoots: Array<{ value: NoteName; label: string }> = [
  { value: 'C', label: 'C' },
  { value: 'G', label: 'G' },
  { value: 'D', label: 'D' },
  { value: 'A', label: 'A' },
  { value: 'E', label: 'E' },
  { value: 'B', label: 'B' },
  { value: 'F#', label: 'F#/Gb' },
  { value: 'C#', label: 'C#/Db' },
  { value: 'G#', label: 'G#/Ab' },
  { value: 'D#', label: 'D#/Eb' },
  { value: 'A#', label: 'A#/Bb' },
  { value: 'F', label: 'F' },
]

const infoPages = [
  {
    title: 'What it is',
    body: 'The circle arranges keys by perfect fifths. Neighboring keys share most notes, so harmonic distance is easy to see.',
  },
  {
    title: 'What it is for',
    body: 'Use it to compare close keys, plan modulations, and spot common chord movement around dominant and subdominant areas.',
  },
  {
    title: 'Calculation tips',
    body: 'Clockwise adds sharps by fifths. Counter-clockwise moves toward flats. Opposite points are tritone-related colors.',
  },
  {
    title: 'Common uses',
    body: 'Practice ii-V-I paths, transpose progressions, find borrowed-key neighbors, and memorize key signatures by movement.',
  },
]

type SelectorTab = 'grid' | 'circle'

interface KeySelectorChipsProps {
  value: NoteName | null
  onChange: (root: NoteName) => void
  onInteract?: () => void
}

export function KeySelectorChips({ value, onChange, onInteract }: KeySelectorChipsProps) {
  const [tab, setTab] = useState<SelectorTab>('grid')
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [infoPage, setInfoPage] = useState(0)
  const currentInfo = infoPages[infoPage]

  const chooseRoot = (root: NoteName) => {
    onInteract?.()
    onChange(root)
  }

  return (
    <section className="studio-card key-selector-card" aria-labelledby="key-selector-heading">
      <div className="studio-card-header key-selector-header">
        <div>
          <p className="eyebrow">Key module</p>
          <h3 id="key-selector-heading">Root selector</h3>
        </div>
        {tab === 'circle' && (
          <button
            type="button"
            className="circle-info-button"
            aria-label="Open circle of fifths info"
            onClick={() => setIsInfoOpen(true)}
          >
            i
          </button>
        )}
      </div>

      <div className="key-selector-tabs" role="tablist" aria-label="Root selector style">
        <button type="button" role="tab" aria-selected={tab === 'grid'} className={tab === 'grid' ? 'is-active' : ''} onClick={() => setTab('grid')}>
          Grid
        </button>
        <button type="button" role="tab" aria-selected={tab === 'circle'} className={tab === 'circle' ? 'is-active' : ''} onClick={() => setTab('circle')}>
          Circle
        </button>
      </div>

      {tab === 'grid' ? (
        <div className="key-root-grid" role="group" aria-label="Chromatic root notes">
          {chromaticRoots.map((root) => (
            <button
              key={root}
              type="button"
              className={`key-root-button${root === value ? ' is-active' : ''}`}
              aria-pressed={root === value}
              onClick={() => chooseRoot(root)}
            >
              {root}
            </button>
          ))}
        </div>
      ) : (
        <div className="fifths-wheel" role="group" aria-label="Circle of fifths root selector">
          {circleRoots.map((root, index) => {
            const angle = (index / circleRoots.length) * 360

            return (
              <button
                key={root.value}
                type="button"
                className={`wheel-key${root.value === value ? ' is-active' : ''}`}
                aria-pressed={root.value === value}
                aria-label={`Set root ${root.label}`}
                style={{ '--wheel-angle': `${angle}deg` } as CSSProperties}
                onClick={() => chooseRoot(root.value)}
              >
                {root.label}
              </button>
            )
          })}
          <div className="wheel-core" aria-hidden="true">
            <span>Fifths</span>
            <strong>{value ?? '—'}</strong>
          </div>
        </div>
      )}

      {isInfoOpen && (
        <div className="circle-info-backdrop" role="presentation" onMouseDown={() => setIsInfoOpen(false)}>
          <div
            className="circle-info-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="circle-info-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="circle-info-header">
              <p className="eyebrow">Circle guide</p>
              <button type="button" aria-label="Close circle info" onClick={() => setIsInfoOpen(false)}>×</button>
            </div>
            <h4 id="circle-info-title">{currentInfo.title}</h4>
            <p>{currentInfo.body}</p>
            <div className="circle-info-footer">
              <span>{infoPage + 1} / {infoPages.length}</span>
              <div>
                <button type="button" onClick={() => setInfoPage((page) => Math.max(0, page - 1))} disabled={infoPage === 0}>Prev</button>
                <button type="button" onClick={() => setInfoPage((page) => Math.min(infoPages.length - 1, page + 1))} disabled={infoPage === infoPages.length - 1}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
