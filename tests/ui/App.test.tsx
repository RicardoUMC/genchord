import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { initAudio, releaseVoicing, startVoicing } from '../../src/audio'

vi.mock('../../src/audio', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  startVoicing: vi.fn().mockResolvedValue(undefined),
  releaseVoicing: vi.fn(),
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
    cleanup()
    document.body.innerHTML = ''
  })

  it('selects a key, triggers a degree, and shows chord feedback', async () => {
    const user = userEvent.setup()
    render(<App />)

    const keyboardWorkspace = screen.getByRole('heading', { name: 'Keyboard workspace' })
    const contextPanel = screen.getByRole('heading', { name: 'Choose the key' })

    expect(keyboardWorkspace.compareDocumentPosition(contextPanel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    await selectCmajor(user)
    const tonicButton = screen.getByRole('button', { name: /I1 \/ Q/i })
    fireEvent.pointerDown(tonicButton)

    expect(screen.getByRole('heading', { name: 'C major' })).toBeInTheDocument()
    expect(screen.getAllByText('I')).toHaveLength(3)
    expect(screen.getByText('C · E · G')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Exact voicing C3-C6' })).toBeInTheDocument()
    expect(screen.getByText('Keyboard voicing')).toBeInTheDocument()
    expect(screen.getByText('C4 · E4 · G4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] })
    expect(screen.getAllByTestId('active-piano-key')).toHaveLength(2)
    expect(screen.getByTestId('generator-piano-key')).toHaveAccessibleName('C4 generator note pressed')
    expect(screen.getByTestId('generator-piano-key')).toHaveClass('is-generator', 'is-active')
    expect(screen.getByTestId('generator-piano-key').querySelector('.source-marker-on-white')).toBeInTheDocument()
    fireEvent.pointerUp(tonicButton)
    expect(releaseVoicing).toHaveBeenCalled()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryByTestId('generator-piano-key')).not.toBeInTheDocument()
    expect(screen.getByText('C · E · G')).toBeInTheDocument()
  })

  it('maps physical keyboard input to the same degree trigger', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.keyboard('5')

    expect(screen.getByText('G major')).toBeInTheDocument()
    expect(screen.getByText('G · B · D')).toBeInTheDocument()
    expect(screen.getByText('G4 · B4 · D5')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'G', octave: 4 }, { note: 'B', octave: 4 }, { note: 'D', octave: 5 }] })
    expect(releaseVoicing).toHaveBeenCalled()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryByTestId('generator-piano-key')).not.toBeInTheDocument()
    expect(screen.getByText('G · B · D')).toBeInTheDocument()
  })

  it('does not retrigger physical keyboard shortcuts while a key is held', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    vi.clearAllMocks()
    fireEvent.keyDown(window, { code: 'Digit1' })
    fireEvent.keyDown(window, { code: 'Digit1', repeat: true })
    fireEvent.keyUp(window, { code: 'Digit1' })

    expect(startVoicing).toHaveBeenCalledTimes(1)
    expect(releaseVoicing).toHaveBeenCalledTimes(1)
  })

  it('guards empty key state and clears chord feedback on key change', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('button', { name: /11 \/ Q/i })).toBeDisabled()
    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: /I1 \/ Q/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /root note/i }), 'G')

    expect(screen.queryByText('C · E · G')).not.toBeInTheDocument()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(initAudio).toHaveBeenCalled()
  })

  it('plays a contextual chord from a clicked visual keyboard key', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'D4' }))

    expect(screen.getByText('D minor')).toBeInTheDocument()
    expect(screen.getAllByText('ii')).toHaveLength(3)
    expect(screen.getByText('D4 · F4 · A4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'D', octave: 4 }, { note: 'F', octave: 4 }, { note: 'A', octave: 4 }] })
    expect(screen.getAllByTestId('active-piano-key')).toHaveLength(2)
    expect(screen.getByTestId('generator-piano-key')).toHaveAccessibleName('D4 generator note pressed')
    fireEvent.pointerUp(screen.getByRole('button', { name: 'D4 generator note pressed' }))
    expect(releaseVoicing).toHaveBeenCalled()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryByTestId('generator-piano-key')).not.toBeInTheDocument()
    expect(screen.getByText('D4 · F4 · A4')).toBeInTheDocument()
  })

  it('plays and highlights only an out-of-scale visual keyboard key', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'C#4' }))

    expect(screen.getByText('Keyboard tone C#4')).toBeInTheDocument()
    expect(screen.getByText('Single note')).toBeInTheDocument()
    expect(screen.getByText('C#4')).toBeInTheDocument()
    expect(screen.queryByText(/outside C major/i)).not.toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'C#', octave: 4 }] })
    expect(screen.queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(screen.getByTestId('generator-piano-key')).toHaveAccessibleName('C#4 generator note pressed')
    expect(screen.getByTestId('generator-piano-key')).toHaveClass('is-generator')
    expect(screen.getByTestId('generator-piano-key').querySelector('.source-marker-on-black')).toBeInTheDocument()
    fireEvent.pointerUp(screen.getByRole('button', { name: 'C#4 generator note pressed' }))
    expect(releaseVoicing).toHaveBeenCalled()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryByTestId('generator-piano-key')).not.toBeInTheDocument()
    expect(screen.getByText('C#4')).toBeInTheDocument()
  })

  it('keeps high visual-keyboard chords fully highlightable inside C3-C6', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'B5' }))

    expect(screen.getByText('B diminished')).toBeInTheDocument()
    expect(screen.getByText('B4 · D5 · F5')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'B', octave: 4 }, { note: 'D', octave: 5 }, { note: 'F', octave: 5 }] })
    expect(screen.getAllByTestId('active-piano-key')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'B4 generator note pressed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'D5 chord tone pressed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'F5 chord tone pressed' })).toBeInTheDocument()
  })

  it('plays and highlights a single keyboard tone when no musical context exists', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'C4' }))

    expect(screen.getByText('Keyboard tone C4')).toBeInTheDocument()
    expect(screen.getByText('Single note')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'C', octave: 4 }] })
  })
})
