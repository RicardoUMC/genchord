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

  it('renders all visible keyboard keys in register groups', () => {
    render(<App />)

    const keyboard = screen.getByLabelText(/piano keyboard/i)

    expect(within(keyboard).getAllByRole('button')).toHaveLength(37)
    expect(within(keyboard).getAllByRole('button').filter((key) => key.classList.contains('white-key'))).toHaveLength(22)
    expect(within(keyboard).getAllByRole('button').filter((key) => key.classList.contains('black-key'))).toHaveLength(15)
    expect(within(keyboard).getByRole('group', { name: 'Register C3 to B3' })).toBeInTheDocument()
    expect(within(keyboard).getByRole('group', { name: 'Register C4 to B4' })).toBeInTheDocument()
    expect(within(keyboard).getByRole('group', { name: 'Register C5 to B5' })).toBeInTheDocument()
    expect(within(keyboard).getByRole('group', { name: 'Register C6 to C6' })).toBeInTheDocument()
    expect(within(keyboard).getByRole('button', { name: 'C3' })).toBeInTheDocument()
    expect(within(keyboard).getByRole('button', { name: 'C6' })).toBeInTheDocument()
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

  it('plays each visual keyboard key entered during an active pointer drag', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    const keyboard = screen.getByLabelText(/piano keyboard/i)
    const d4 = within(keyboard).getByRole('button', { name: 'D4' })
    const e4 = within(keyboard).getByRole('button', { name: 'E4' })

    vi.clearAllMocks()
    fireEvent.pointerEnter(e4, { pointerId: 1, buttons: 1 })
    expect(startVoicing).not.toHaveBeenCalled()

    fireEvent.pointerDown(d4, { pointerId: 1, buttons: 1 })
    fireEvent.pointerEnter(e4, { pointerId: 1, buttons: 1 })

    expect(startVoicing).toHaveBeenCalledTimes(2)
    expect(startVoicing).toHaveBeenLastCalledWith({ voicing: [{ note: 'E', octave: 4 }, { note: 'G', octave: 4 }, { note: 'B', octave: 4 }] })
    expect(screen.getByText('E minor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E4 generator note pressed' })).toBeInTheDocument()

    fireEvent.pointerUp(screen.getByRole('button', { name: 'E4 generator note pressed' }), { pointerId: 1 })
    expect(releaseVoicing).toHaveBeenCalledTimes(1)
    expect(within(keyboard).queryByTestId('generator-piano-key')).not.toBeInTheDocument()
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

  it('plays only available high visual-keyboard chord tones without octave fallback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'B5' }))

    expect(screen.getByText('B diminished')).toBeInTheDocument()
    expect(screen.getAllByText('B5').length).toBeGreaterThan(0)
    expect(screen.getByText('Partial voicing: only notes available on the visible keyboard are shown and played.')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'B', octave: 5 }] })
    expect(screen.queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'B5 generator note pressed' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'B4 generator note pressed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'D5 chord tone pressed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'F5 chord tone pressed' })).not.toBeInTheDocument()
  })

  it('plays and highlights C6 as a partial chord at the keyboard edge', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'C6' }))

    expect(screen.getAllByText('C major').length).toBeGreaterThan(0)
    expect(screen.getAllByText('C6').length).toBeGreaterThan(0)
    expect(screen.getByText('Partial voicing: only notes available on the visible keyboard are shown and played.')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith({ voicing: [{ note: 'C', octave: 6 }] })
    expect(screen.getByRole('button', { name: 'C6 generator note pressed' })).toBeInTheDocument()
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
