import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const toneMock = vi.hoisted(() => ({
  dispose: vi.fn(),
  now: vi.fn(() => 12.25),
  start: vi.fn(() => Promise.resolve()),
  toDestination: vi.fn(function (this: unknown) {
    return this
  }),
  triggerAttackRelease: vi.fn(),
}))

vi.mock('tone', () => ({
  now: toneMock.now,
  start: toneMock.start,
  Synth: vi.fn(),
  PolySynth: vi.fn(function (this: { dispose: () => void; toDestination: () => unknown; triggerAttackRelease: () => void }) {
    this.dispose = toneMock.dispose
    this.toDestination = toneMock.toDestination
    this.triggerAttackRelease = toneMock.triggerAttackRelease
  }),
}))

import { disposeAudio, initAudio, playChord } from '../../src/audio/playback'

describe('audio playback adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    disposeAudio()
  })

  afterEach(() => {
    disposeAudio()
  })

  it('starts Tone.js and creates the synth during explicit audio initialization', async () => {
    await initAudio()

    expect(toneMock.start).toHaveBeenCalledTimes(1)
    expect(toneMock.toDestination).toHaveBeenCalledTimes(1)
  })

  it('triggers all resolved chord notes at the requested octave', async () => {
    await playChord({ notes: ['C', 'E', 'G'], octave: 4 })

    expect(toneMock.start).toHaveBeenCalledTimes(1)
    expect(toneMock.triggerAttackRelease).toHaveBeenCalledWith(['C4', 'E4', 'G4'], '2n', 12.25)
  })
})
