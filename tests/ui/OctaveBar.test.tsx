import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DegreeChordOctave } from '../../src/music-core'
import { OctaveBar } from '../../src/ui/OctaveBar'

function StatefulOctaveBar({ initial = 4 }: { initial?: DegreeChordOctave }) {
  const [octave, setOctave] = useState<DegreeChordOctave>(initial)

  return <OctaveBar value={octave} onChange={setOctave} />
}

afterEach(() => {
  cleanup()
})

describe('OctaveBar', () => {
  it('selects octave sections by click without visible segment labels', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<OctaveBar value={4} onChange={onChange} />)

    expect(screen.queryByText(/current octave/i)).not.toBeInTheDocument()
    expect(screen.getByText('Octave 4')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
    screen.getAllByRole('button').forEach((button) => {
      expect(button).toHaveTextContent('')
    })

    await user.click(screen.getByRole('button', { name: /set chord octave 3/i }))

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('cycles between octave sections with global left and right arrow keys', async () => {
    const user = userEvent.setup()

    render(<StatefulOctaveBar initial={4} />)

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Octave 5')).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Octave 3')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('Octave 5')).toBeInTheDocument()
  })

  it('does not handle global arrow keys while typing in form fields', async () => {
    const user = userEvent.setup()

    render(
      <>
        <input aria-label="Typing target" />
        <StatefulOctaveBar initial={4} />
      </>,
    )

    await user.click(screen.getByRole('textbox', { name: /typing target/i }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByText('Octave 4')).toBeInTheDocument()
  })
})
