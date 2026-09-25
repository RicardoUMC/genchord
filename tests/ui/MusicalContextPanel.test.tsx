import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MusicalContextPanel } from '../../src/ui/MusicalContextPanel'

describe('MusicalContextPanel', () => {
  afterEach(() => {
    cleanup()
  })

  it('is collapsed by default when the parent passes expanded=false', () => {
    const { container } = render(<MusicalContextPanel root="C" mode="ionian" expanded={false} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders mode metadata, examples, progressions, and key-specific diatonic chords', () => {
    render(<MusicalContextPanel root="C" mode="dorian" expanded />)

    expect(screen.getByRole('heading', { name: 'Musical context' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'C Dorian' })).toBeInTheDocument()
    expect(screen.getByText(/minor mode with a raised 6th/i)).toBeInTheDocument()
    expect(screen.getByText(/♮6 vs Aeolian ♭6/i)).toBeInTheDocument()
    expect(screen.getByText('i-IV')).toBeInTheDocument()
    expect(screen.getByText('So What — Miles Davis')).toBeInTheDocument()

    const chords = screen.getByRole('heading', { name: 'Diatonic chords in C Dorian' }).closest('section')
    expect(chords).not.toBeNull()
    expect(within(chords as HTMLElement).getByText('C minor')).toBeInTheDocument()
    expect(within(chords as HTMLElement).getByText('F major')).toBeInTheDocument()
    expect(within(chords as HTMLElement).getByText('(C · Eb · G)')).toBeInTheDocument()
  })

  it('updates diatonic chords when the selected key or mode changes', () => {
    const { rerender } = render(<MusicalContextPanel root="C" mode="ionian" expanded />)

    expect(screen.getByRole('heading', { name: 'Diatonic chords in C Ionian (Major)' })).toBeInTheDocument()
    expect(screen.getByText('B diminished')).toBeInTheDocument()

    rerender(<MusicalContextPanel root="A" mode="harmonic-minor" expanded />)

    expect(screen.getByRole('heading', { name: 'A Harmonic Minor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Diatonic chords in A Harmonic Minor' })).toBeInTheDocument()
    expect(screen.getByText('E major')).toBeInTheDocument()
    expect(screen.getByText('G# diminished')).toBeInTheDocument()
  })
})
