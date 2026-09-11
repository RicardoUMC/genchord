import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { initAudio, playChord } from '../../src/audio'

vi.mock('../../src/audio', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  playChord: vi.fn().mockResolvedValue(undefined),
}))

async function selectCmajor(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByRole('combobox', { name: /root note/i }), 'C')
  await user.click(screen.getByRole('button', { name: 'major' }))
}

describe('GenChord study UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('selects a key, triggers a degree, and shows chord feedback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.click(screen.getByRole('button', { name: /I1 \/ Q/i }))

    expect(screen.getByRole('heading', { name: 'C major' })).toBeInTheDocument()
    expect(screen.getAllByText('I')).toHaveLength(2)
    expect(screen.getByText('C · E · G')).toBeInTheDocument()
    expect(playChord).toHaveBeenCalledWith({ notes: ['C', 'E', 'G'], octave: 4 })
    expect(screen.getAllByTestId('active-piano-key')).toHaveLength(7)
  })

  it('maps physical keyboard input to the same degree trigger', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.keyboard('5')

    expect(screen.getByText('G major')).toBeInTheDocument()
    expect(screen.getByText('G · B · D')).toBeInTheDocument()
    expect(playChord).toHaveBeenCalledWith({ notes: ['G', 'B', 'D'], octave: 4 })
  })

  it('guards empty key state and clears chord feedback on key change', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('button', { name: /11 \/ Q/i })).toBeDisabled()
    await selectCmajor(user)
    await user.click(screen.getByRole('button', { name: /I1 \/ Q/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /root note/i }), 'G')

    expect(screen.queryByText('C · E · G')).not.toBeInTheDocument()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(initAudio).toHaveBeenCalled()
  })
})
