import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const toneMock = vi.hoisted(() => ({
  dispose: vi.fn(),
  now: vi.fn(() => 12.25),
  start: vi.fn(() => Promise.resolve()),
  toDestination: vi.fn(function (this: unknown) {
    return this
  }),
  triggerAttackRelease: vi.fn(),
  triggerAttack: vi.fn(),
  triggerRelease: vi.fn(),
  synthTriggerAttackRelease: vi.fn(),
  samplerTriggerAttackRelease: vi.fn(),
  synthTriggerAttack: vi.fn(),
  samplerTriggerAttack: vi.fn(),
  synthTriggerRelease: vi.fn(),
  samplerTriggerRelease: vi.fn(),
  samplerLoaded: false,
  contextState: 'suspended' as 'running' | 'suspended',
  samplerOptions: undefined as ToneSamplerOptions | undefined,
}))

type ToneSamplerOptions = {
  onerror?: (error: Error) => void
}

vi.mock('tone', () => ({
  context: {
    get state() {
      return toneMock.contextState
    },
  },
  now: toneMock.now,
  start: vi.fn(() => {
    const started = toneMock.start()
    return Promise.resolve(started).then(() => {
      toneMock.contextState = 'running'
    })
  }),
  Synth: vi.fn(),
  PolySynth: vi.fn(function (this: { dispose: () => void; toDestination: () => unknown; triggerAttackRelease: () => void; triggerAttack: () => void; triggerRelease: () => void }) {
    this.dispose = toneMock.dispose
    this.toDestination = toneMock.toDestination
    this.triggerAttackRelease = toneMock.synthTriggerAttackRelease
    this.triggerAttack = toneMock.synthTriggerAttack
    this.triggerRelease = toneMock.synthTriggerRelease
  }),
  Sampler: vi.fn(function (this: { dispose: () => void; toDestination: () => unknown; triggerAttackRelease: () => void; triggerAttack: () => void; triggerRelease: () => void; loaded: boolean }, options: ToneSamplerOptions) {
    toneMock.samplerOptions = options
    this.dispose = toneMock.dispose
    this.toDestination = toneMock.toDestination
    this.triggerAttackRelease = toneMock.samplerTriggerAttackRelease
    this.triggerAttack = toneMock.samplerTriggerAttack
    this.triggerRelease = toneMock.samplerTriggerRelease
    Object.defineProperty(this, 'loaded', {
      get: () => toneMock.samplerLoaded,
    })
  }),
}))

import { disposeAudio, initAudio, playVoicing, prepareAudioInstruments, releaseVoicing, startVoicing } from '../../src/audio/playback'

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

describe('audio playback adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    toneMock.samplerLoaded = false
    toneMock.contextState = 'suspended'
    toneMock.samplerOptions = undefined
    disposeAudio()
  })

  afterEach(() => {
    disposeAudio()
  })

  it('starts Tone.js and creates the synth during explicit audio initialization', async () => {
    await initAudio()

    expect(toneMock.start).toHaveBeenCalledTimes(1)
    expect(toneMock.toDestination).toHaveBeenCalledTimes(2)
  })

  it('prepares synth fallback and sampler downloads without starting audio', () => {
    prepareAudioInstruments()

    expect(toneMock.start).not.toHaveBeenCalled()
    expect(toneMock.toDestination).toHaveBeenCalledTimes(2)
    expect(toneMock.samplerOptions).toBeDefined()
  })

  it('triggers all resolved voiced notes at the requested octave', async () => {
    await playVoicing({ voicing: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] })

    expect(toneMock.start).toHaveBeenCalledTimes(1)
    expect(toneMock.synthTriggerAttackRelease).toHaveBeenCalledWith(['C4', 'E4', 'G4'], '2n', 12.25)
  })

  it('uses the piano sampler when samples have loaded', async () => {
    toneMock.samplerLoaded = true

    await playVoicing({ voicing: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] })

    expect(toneMock.samplerTriggerAttackRelease).toHaveBeenCalledWith(['C4', 'E4', 'G4'], '2n', 12.25)
    expect(toneMock.synthTriggerAttackRelease).not.toHaveBeenCalled()
  })

  it('keeps using the synth fallback when sample loading fails', async () => {
    await initAudio()
    toneMock.samplerOptions?.onerror?.(new Error('sample failed'))

    await playVoicing({ voicing: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] })

    expect(toneMock.synthTriggerAttackRelease).toHaveBeenCalledWith(['C4', 'E4', 'G4'], '2n', 12.25)
    expect(toneMock.samplerTriggerAttackRelease).not.toHaveBeenCalled()
  })

  it('sustains notes until an explicit release', async () => {
    await startVoicing({ triggerId: 'degree:1', voicing: [{ note: 'D', octave: 4 }, { note: 'F', octave: 4 }, { note: 'A', octave: 4 }] })
    releaseVoicing('degree:1')

    expect(toneMock.synthTriggerAttack).toHaveBeenCalledWith(['D4', 'F4', 'A4'], 12.25)
    expect(toneMock.synthTriggerRelease).toHaveBeenCalledWith(['D4', 'F4', 'A4'], 12.25)
  })

  it('does not attack sustained notes after release happens before audio initialization completes', async () => {
    const audioStart = deferred<void>()
    toneMock.start.mockReturnValueOnce(audioStart.promise)

    const pendingStart = startVoicing({ triggerId: 'degree:1', voicing: [{ note: 'D', octave: 4 }, { note: 'F', octave: 4 }, { note: 'A', octave: 4 }] })
    releaseVoicing('degree:1')

    expect(toneMock.synthTriggerAttack).not.toHaveBeenCalled()

    audioStart.resolve()
    await pendingStart

    expect(toneMock.synthTriggerAttack).not.toHaveBeenCalled()
    expect(toneMock.synthTriggerRelease).not.toHaveBeenCalled()
  })

  it('sustains overlapping triggers independently', async () => {
    await startVoicing({ triggerId: 'degree:1', voicing: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] })
    await startVoicing({ triggerId: 'degree:5', voicing: [{ note: 'G', octave: 4 }, { note: 'B', octave: 4 }, { note: 'D', octave: 5 }] })

    releaseVoicing('degree:1')

    expect(toneMock.synthTriggerRelease).toHaveBeenCalledWith(['C4', 'E4'], 12.25)
    expect(toneMock.synthTriggerRelease).not.toHaveBeenCalledWith(['G4'], 12.25)
    expect(toneMock.synthTriggerAttack).toHaveBeenLastCalledWith(['B4', 'D5'], 12.25)
  })

  it('retries audio initialization after a failed unlock attempt', async () => {
    toneMock.start.mockRejectedValueOnce(new Error('not activated'))

    await expect(initAudio()).rejects.toThrow('not activated')
    await initAudio()

    expect(toneMock.start).toHaveBeenCalledTimes(2)
    expect(toneMock.contextState).toBe('running')
  })

  it('restarts Tone.js when the context is suspended after a successful unlock', async () => {
    await initAudio()
    toneMock.contextState = 'suspended'

    await initAudio()

    expect(toneMock.start).toHaveBeenCalledTimes(2)
    expect(toneMock.contextState).toBe('running')
  })

  it('releases a shared note only after its last owner releases it', async () => {
    await startVoicing({ triggerId: 'first', voicing: [{ note: 'C', octave: 4 }] })
    await startVoicing({ triggerId: 'second', voicing: [{ note: 'C', octave: 4 }] })

    releaseVoicing('first')
    expect(toneMock.synthTriggerRelease).not.toHaveBeenCalled()

    releaseVoicing('second')
    expect(toneMock.synthTriggerRelease).toHaveBeenCalledWith(['C4'], 12.25)
  })

  it('keeps sustained note ownership separate when playback switches from synth to sampler', async () => {
    await startVoicing({ triggerId: 'synth-note', voicing: [{ note: 'C', octave: 4 }] })
    toneMock.samplerLoaded = true

    await startVoicing({ triggerId: 'sampler-note', voicing: [{ note: 'C', octave: 4 }] })

    expect(toneMock.synthTriggerAttack).toHaveBeenCalledWith(['C4'], 12.25)
    expect(toneMock.samplerTriggerAttack).toHaveBeenCalledWith(['C4'], 12.25)

    releaseVoicing('synth-note')
    expect(toneMock.synthTriggerRelease).toHaveBeenCalledWith(['C4'], 12.25)
    expect(toneMock.samplerTriggerRelease).not.toHaveBeenCalled()

    releaseVoicing('sampler-note')
    expect(toneMock.samplerTriggerRelease).toHaveBeenCalledWith(['C4'], 12.25)
  })
})
