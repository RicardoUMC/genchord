import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { initAudio, releaseAllVoicings, releaseVoicing, startVoicing } from '../../src/audio'

vi.mock('../../src/audio', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  installAudioWarmup: vi.fn(() => vi.fn()),
  prepareAudioInstruments: vi.fn(),
  startVoicing: vi.fn().mockResolvedValue(undefined),
  releaseVoicing: vi.fn(),
  releaseAllVoicings: vi.fn(),
}))

async function selectCmajor(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByRole('combobox', { name: /root note/i }), 'C')
  await user.selectOptions(screen.getByRole('combobox', { name: /scale \//i }), 'ionian')
  await user.click(document.body)
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

    const nowStudying = screen.getByRole('heading', { name: 'No key selected' })
    const contextPanel = screen.getByRole('heading', { name: 'Choose the key' })

    expect(nowStudying.compareDocumentPosition(contextPanel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    await selectCmajor(user)
    const tonicButton = screen.getByRole('button', { name: /I1 \/ Q/i })
    fireEvent.pointerDown(tonicButton)

    expect(screen.getByRole('heading', { name: 'C Major' })).toBeInTheDocument()
    expect(screen.getAllByText('I')).toHaveLength(3)
    expect(screen.getByText('C · E · G')).toBeInTheDocument()
    expect(screen.getByText('Keyboard C3-C6')).toBeInTheDocument()
    expect(screen.getByText('Keyboard voicing')).toBeInTheDocument()
    expect(screen.getByText('C4 · E4 · G4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] }))
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

  it('applies selected triad inversion to degree display, keyboard voicing, and playback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.selectOptions(screen.getByLabelText(/triad inversion/i), 'first')
    fireEvent.pointerDown(screen.getByRole('button', { name: /I1 \/ Q/i }), { pointerId: 1, buttons: 1 })

    expect(screen.getByText('C major')).toBeInTheDocument()
    expect(screen.getByText('first inversion')).toBeInTheDocument()
    expect(screen.getByText('C · E · G')).toBeInTheDocument()
    expect(screen.getByText('E4 · G4 · C5')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'E', octave: 4 }, { note: 'G', octave: 4 }, { note: 'C', octave: 5 }] }))
    expect(screen.getByRole('button', { name: 'E4 chord tone pressed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'G4 chord tone pressed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'C5 generator note pressed' })).toBeInTheDocument()
  })

  it('applies selected degree register to degree display, keyboard voicing, and playback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.selectOptions(screen.getByLabelText(/degree register/i), '3')
    fireEvent.pointerDown(screen.getByRole('button', { name: /V5 \/ T/i }), { pointerId: 1, buttons: 1 })

    expect(screen.getByText('G major')).toBeInTheDocument()
    expect(screen.getByText('G3 · B3 · D4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'D', octave: 4 }] }))
    expect(screen.getByRole('button', { name: 'G3 generator note pressed' })).toBeInTheDocument()
  })

  it('applies selected degree register to physical degree shortcuts', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.selectOptions(screen.getByLabelText(/degree register/i), '5')
    fireEvent.keyDown(window, { code: 'Digit2' })

    expect(screen.getByText('D minor')).toBeInTheDocument()
    expect(screen.getByText('D5 · F5 · A5')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'D', octave: 5 }, { note: 'F', octave: 5 }, { note: 'A', octave: 5 }] }))
  })

  it('keeps visual-keyboard clicks in the clicked register when degree register changes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.selectOptions(screen.getByLabelText(/degree register/i), '5')
    fireEvent.pointerDown(screen.getByRole('button', { name: 'D4' }), { pointerId: 1, buttons: 1 })

    expect(screen.getByText('D minor')).toBeInTheDocument()
    expect(screen.getByText('D4 · F4 · A4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'D', octave: 4 }, { note: 'F', octave: 4 }, { note: 'A', octave: 4 }] }))
    expect(screen.queryByText('D5 · F5 · A5')).not.toBeInTheDocument()
  })

  it('applies selected triad inversion to contextual visual-keyboard chords', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.selectOptions(screen.getByLabelText(/triad inversion/i), 'second')
    fireEvent.pointerDown(screen.getByRole('button', { name: 'D4' }), { pointerId: 1, buttons: 1 })

    expect(screen.getByText('D minor')).toBeInTheDocument()
    expect(screen.getByText('second inversion')).toBeInTheDocument()
    expect(screen.getByText('A4 · D5 · F5')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'A', octave: 4 }, { note: 'D', octave: 5 }, { note: 'F', octave: 5 }] }))
    expect(screen.getByRole('button', { name: 'D5 generator note pressed' })).toBeInTheDocument()
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

  it('visually mutes out-of-scale keys without disabling keyboard playback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)

    const keyboard = screen.getByLabelText(/piano keyboard/i)
    const cSharp = within(keyboard).getByRole('button', { name: 'C#4' })
    const d = within(keyboard).getByRole('button', { name: 'D4' })
    const scaleGuideStyle = screen.getByLabelText(/scale guide style/i)
    const degreePanel = screen.getByRole('region', { name: /trigger a diatonic triad/i })
    const controls = screen.getByLabelText(/sound and study configuration/i)

    expect(keyboard).toHaveAttribute('data-scale-guide-style', 'dim')
    expect(scaleGuideStyle).toHaveValue('dim')
    expect(screen.getByLabelText(/degree register/i)).toHaveValue('4')
    expect(scaleGuideStyle.closest('.instrument-stage')).toContainElement(scaleGuideStyle)
    expect(degreePanel.closest('.instrument-stage')).toContainElement(degreePanel)
    expect(controls).not.toContainElement(scaleGuideStyle)
    expect(controls).not.toContainElement(degreePanel)
    expect(degreePanel.compareDocumentPosition(scaleGuideStyle)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(degreePanel.compareDocumentPosition(keyboard)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(scaleGuideStyle.compareDocumentPosition(keyboard)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(cSharp).toHaveClass('is-out-of-scale', 'is-scale-dimmed')
    expect(cSharp).toHaveAttribute('data-scale-membership', 'out')
    expect(cSharp).not.toBeDisabled()
    expect(d).not.toHaveClass('is-out-of-scale')
    expect(d).toHaveAttribute('data-scale-membership', 'in')

    fireEvent.pointerDown(cSharp)

    expect(screen.getByText('Keyboard tone C#4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'C#', octave: 4 }] }))
    expect(screen.getByTestId('generator-piano-key')).toHaveClass('is-out-of-scale', 'is-generator')
  })

  it('switches scale guidance between dim and highlight styles', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)

    const keyboard = screen.getByLabelText(/piano keyboard/i)
    const scaleGuideStyle = screen.getByLabelText(/scale guide style/i)

    expect(keyboard).toHaveAttribute('data-scale-guide-style', 'dim')

    await user.selectOptions(scaleGuideStyle, 'highlight')

    expect(scaleGuideStyle).toHaveValue('highlight')
    expect(keyboard).toHaveAttribute('data-scale-guide-style', 'highlight')
    expect(within(keyboard).getByRole('button', { name: 'D4' })).toHaveAttribute('data-scale-membership', 'in')
    expect(within(keyboard).getByRole('button', { name: 'C#4' })).toHaveAttribute('data-scale-membership', 'out')
    expect(within(keyboard).getByRole('button', { name: 'C#4' })).not.toHaveClass('is-scale-dimmed')
  })

  it('matches flat scale notes to sharp visual keyboard keys for scale guidance', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: /root note/i }), 'Ab')
    await user.selectOptions(screen.getByRole('combobox', { name: /scale \//i }), 'ionian')

    const keyboard = screen.getByLabelText(/piano keyboard/i)

    expect(within(keyboard).getByRole('button', { name: 'C#4' })).not.toHaveClass('is-out-of-scale')
    expect(within(keyboard).getByRole('button', { name: 'C#4' })).toHaveAttribute('data-scale-membership', 'in')
    expect(within(keyboard).getByRole('button', { name: 'D4' })).toHaveClass('is-out-of-scale')
  })

  it('maps physical keyboard input to the same degree trigger', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.keyboard('5')

    expect(screen.getByText('G major')).toBeInTheDocument()
    expect(screen.getByText('G · B · D')).toBeInTheDocument()
    expect(screen.getByText('G4 · B4 · D5')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'G', octave: 4 }, { note: 'B', octave: 4 }, { note: 'D', octave: 5 }] }))
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

  it('lets editable controls use degree shortcut keys without triggering playback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    vi.clearAllMocks()

    const rootSelect = screen.getByRole('combobox', { name: /root note/i })
    const keyDownEvent = new KeyboardEvent('keydown', { code: 'Digit1', bubbles: true, cancelable: true })
    const keyUpEvent = new KeyboardEvent('keyup', { code: 'Digit1', bubbles: true, cancelable: true })

    expect(rootSelect.dispatchEvent(keyDownEvent)).toBe(true)
    expect(rootSelect.dispatchEvent(keyUpEvent)).toBe(true)
    expect(keyDownEvent.defaultPrevented).toBe(false)
    expect(keyUpEvent.defaultPrevented).toBe(false)
    expect(startVoicing).not.toHaveBeenCalled()
    expect(releaseVoicing).not.toHaveBeenCalled()
  })

  it('releases a captured shortcut even when keyup targets an editable control', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    vi.clearAllMocks()

    const rootSelect = screen.getByRole('combobox', { name: /root note/i })
    const keyUpEvent = new KeyboardEvent('keyup', { code: 'Digit1', bubbles: true, cancelable: true })

    fireEvent.keyDown(window, { code: 'Digit1' })
    expect(rootSelect.dispatchEvent(keyUpEvent)).toBe(false)

    expect(keyUpEvent.defaultPrevented).toBe(true)
    expect(startVoicing).toHaveBeenCalledTimes(1)
    expect(releaseVoicing).toHaveBeenCalledWith('degree:shortcut:Digit1')
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
    expect(releaseAllVoicings).toHaveBeenCalled()
    expect(initAudio).toHaveBeenCalled()
  })

  it('releases sustained playback when mode changes clear held inputs', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: /I1 \/ Q/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /scale \//i }), 'aeolian')

    expect(screen.queryByText('C · E · G')).not.toBeInTheDocument()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(releaseAllVoicings).toHaveBeenCalled()
  })

  it('plays a contextual chord from a clicked visual keyboard key', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'D4' }))

    expect(screen.getByText('D minor')).toBeInTheDocument()
    expect(screen.getAllByText('ii')).toHaveLength(3)
    expect(screen.getByText('D4 · F4 · A4')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'D', octave: 4 }, { note: 'F', octave: 4 }, { note: 'A', octave: 4 }] }))
    expect(screen.getAllByTestId('active-piano-key')).toHaveLength(2)
    expect(screen.getByTestId('generator-piano-key')).toHaveAccessibleName('D4 generator note pressed')
    fireEvent.pointerUp(screen.getByRole('button', { name: 'D4 generator note pressed' }))
    expect(releaseVoicing).toHaveBeenCalled()
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryAllByTestId('active-piano-key')).toHaveLength(0)
    expect(within(screen.getByLabelText(/piano keyboard/i)).queryByTestId('generator-piano-key')).not.toBeInTheDocument()
    expect(screen.getByText('D4 · F4 · A4')).toBeInTheDocument()
  })

  it('starts visual keyboard playback from click-only activation', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    const d4 = screen.getByRole('button', { name: 'D4' })

    fireEvent.click(d4)

    expect(screen.getByText('D minor')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ triggerId: 'keyboard:click:D4', voicing: [{ note: 'D', octave: 4 }, { note: 'F', octave: 4 }, { note: 'A', octave: 4 }] }))
    await waitFor(() => {
      expect(releaseVoicing).toHaveBeenCalledWith('keyboard:click:D4')
    })
  })

  it('does not double-trigger visual keyboard playback after pointer activation dispatches click', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    const d4 = screen.getByRole('button', { name: 'D4' })

    vi.clearAllMocks()
    fireEvent.pointerDown(d4, { pointerId: 1, buttons: 1 })
    fireEvent.pointerUp(d4, { pointerId: 1 })
    fireEvent.click(d4)

    expect(startVoicing).toHaveBeenCalledTimes(1)
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ triggerId: 'keyboard:pointer:1:D4' }))
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
    expect(startVoicing).toHaveBeenLastCalledWith(expect.objectContaining({ voicing: [{ note: 'E', octave: 4 }, { note: 'G', octave: 4 }, { note: 'B', octave: 4 }] }))
    expect(screen.getByText('E minor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E4 generator note pressed' })).toBeInTheDocument()

    fireEvent.pointerUp(screen.getByRole('button', { name: 'E4 generator note pressed' }), { pointerId: 1 })
    expect(releaseVoicing).toHaveBeenCalledTimes(2)
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
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'C#', octave: 4 }] }))
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
    expect(screen.queryByText('Partial voicing: visible keyboard notes only.')).not.toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'B', octave: 5 }] }))
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

    expect(screen.getAllByText('C Major').length).toBeGreaterThan(0)
    expect(screen.getAllByText('C6').length).toBeGreaterThan(0)
    expect(screen.queryByText('Partial voicing: visible keyboard notes only.')).not.toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'C', octave: 6 }] }))
    expect(screen.getByRole('button', { name: 'C6 generator note pressed' })).toBeInTheDocument()
  })

  it('keeps overlapping held inputs active when one trigger is released', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    fireEvent.keyDown(window, { code: 'Digit1' })
    fireEvent.keyDown(window, { code: 'Digit2' })
    fireEvent.keyUp(window, { code: 'Digit1' })

    expect(releaseVoicing).toHaveBeenCalledWith('degree:shortcut:Digit1')
    expect(screen.getByRole('button', { name: 'D4 generator note pressed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'F4 chord tone pressed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A4 chord tone pressed' })).toBeInTheDocument()
  })

  it('releases only the matching visual keyboard pointer and displays the remaining held input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    const keyboard = screen.getByLabelText(/piano keyboard/i)

    fireEvent.pointerDown(within(keyboard).getByRole('button', { name: 'D4' }), { pointerId: 1, buttons: 1 })
    fireEvent.pointerDown(within(keyboard).getByRole('button', { name: 'F4 chord tone pressed' }), { pointerId: 2, buttons: 1 })
    fireEvent.pointerUp(window, { pointerId: 1 })

    expect(releaseVoicing).toHaveBeenCalledWith('keyboard:pointer:1:D4')
    expect(releaseVoicing).not.toHaveBeenCalledWith('keyboard:pointer:2:F4')
    expect(screen.getByText('F major')).toBeInTheDocument()
    expect(screen.getByText('F4 · A4 · C5')).toBeInTheDocument()
    expect(within(keyboard).getByRole('button', { name: 'F4 generator note pressed' })).toBeInTheDocument()
  })

  it('toggles automatic chords with the visible control and plays single tones while disabled', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.click(screen.getByRole('button', { name: 'Auto chords: On' }))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'D4' }), { pointerId: 1, buttons: 1 })

    expect(screen.getByText('Keyboard tone D4')).toBeInTheDocument()
    expect(screen.getByText('Single note')).toBeInTheDocument()
    expect(screen.queryByText('D minor')).not.toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'D', octave: 4 }] }))
    expect(screen.getByRole('button', { name: 'D4 generator note pressed' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'F4 chord tone pressed' })).not.toBeInTheDocument()
  })

  it('plays degree buttons as single selected notes while automatic chords are disabled', async () => {
    const user = userEvent.setup()
    render(<App />)

    await selectCmajor(user)
    await user.click(screen.getByRole('button', { name: 'Auto chords: On' }))
    fireEvent.pointerDown(screen.getByRole('button', { name: /ii2 \/ W/i }), { pointerId: 1, buttons: 1 })

    expect(screen.getByText('Keyboard tone D4')).toBeInTheDocument()
    expect(screen.getByText('Single note')).toBeInTheDocument()
    expect(screen.queryByText('D minor')).not.toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'D', octave: 4 }] }))
  })

  it('toggles automatic chords with the A shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggle = screen.getByRole('button', { name: 'Auto chords: On' })

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('a')
    expect(screen.getByRole('button', { name: 'Auto chords: Off' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('plays and highlights a single keyboard tone when no musical context exists', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'C4' }))

    expect(screen.getByText('Keyboard tone C4')).toBeInTheDocument()
    expect(screen.getByText('Single note')).toBeInTheDocument()
    expect(startVoicing).toHaveBeenCalledWith(expect.objectContaining({ voicing: [{ note: 'C', octave: 4 }] }))
  })
})
