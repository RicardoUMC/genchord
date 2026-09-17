import * as Tone from 'tone'
import type { PlaybackEvent, SustainedPlaybackEvent } from '../music-core'

type PlaybackInstrument = {
  dispose: () => unknown
  triggerAttack: (notes: string[], time?: string | number) => unknown
  triggerAttackRelease: (notes: string[], duration: string | number, time?: string | number) => unknown
  triggerRelease: (notes: string[], time?: string | number) => unknown
}

const PIANO_SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

const PIANO_SAMPLE_URLS = {
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
}

let synth: Tone.PolySynth<Tone.Synth<Tone.SynthOptions>> | undefined
let sampler: Tone.Sampler | undefined
let samplerUnavailable = false
let initPromise: Promise<void> | undefined
let audioStarted = false
let warmupCleanup: (() => void) | undefined
type SustainedTrigger = { notes: string[]; instrument?: PlaybackInstrument }

let sustainedTriggers = new Map<string, SustainedTrigger>()
let noteOwners = new Map<PlaybackInstrument, Map<string, Set<string>>>()

function getSynth() {
  synth ??= new Tone.PolySynth(Tone.Synth, {
    envelope: {
      attack: 0.01,
      decay: 0.08,
      sustain: 0.35,
      release: 0.45,
    },
  }).toDestination()

  return synth
}

function getSampler() {
  if (samplerUnavailable) {
    return undefined
  }

  if (!sampler) {
    try {
      sampler = new Tone.Sampler({
        urls: PIANO_SAMPLE_URLS,
        baseUrl: PIANO_SAMPLE_BASE_URL,
        release: 0.7,
        onerror: () => {
          samplerUnavailable = true
        },
      }).toDestination()
    } catch {
      samplerUnavailable = true
      return undefined
    }
  }

  return sampler
}

function getInstrument(): PlaybackInstrument {
  const piano = getSampler()

  if (piano?.loaded) {
    return piano
  }

  return getSynth()
}

function isAudioRunning() {
  return Tone.context.state === 'running'
}

export async function initAudio(): Promise<void> {
  if (isAudioRunning()) {
    audioStarted = true
    getSynth()
    getSampler()
    return
  }

  audioStarted = false

  initPromise ??= Tone.start().then(() => {
    initPromise = undefined
    audioStarted = isAudioRunning()
    getSynth()
    getSampler()
  }).catch((error: unknown) => {
    initPromise = undefined
    throw error
  })

  return initPromise
}

export function installAudioWarmup(target: Window = window): () => void {
  if (warmupCleanup) {
    return warmupCleanup
  }

  const warmAudio = () => {
    if (isAudioRunning()) {
      warmupCleanup?.()
      return
    }

    void initAudio().then(() => {
      if (isAudioRunning()) {
        warmupCleanup?.()
      }
    }).catch(() => {
      // Keep listeners installed so the next valid user activation can retry.
    })
  }

  target.addEventListener('pointerup', warmAudio)
  target.addEventListener('click', warmAudio)
  target.addEventListener('keydown', warmAudio)

  warmupCleanup = () => {
    target.removeEventListener('pointerup', warmAudio)
    target.removeEventListener('click', warmAudio)
    target.removeEventListener('keydown', warmAudio)
    warmupCleanup = undefined
  }

  return warmupCleanup
}

export async function playVoicing(event: PlaybackEvent): Promise<void> {
  await initAudio()
  const notes = event.voicing.map(({ note, octave }) => `${note}${octave}`)
  getInstrument().triggerAttackRelease(notes, '2n', Tone.now())
}

export async function startVoicing(event: SustainedPlaybackEvent): Promise<void> {
  releaseVoicing(event.triggerId)

  const notes = event.voicing.map(({ note, octave }) => `${note}${octave}`)
  const pendingTrigger: SustainedTrigger = { notes }
  sustainedTriggers.set(event.triggerId, pendingTrigger)

  await initAudio()

  if (sustainedTriggers.get(event.triggerId) !== pendingTrigger) {
    return
  }

  const now = Tone.now()
  const instrument = getInstrument()
  const instrumentOwners = noteOwners.get(instrument) ?? new Map<string, Set<string>>()
  const notesToAttack = notes.filter((note) => !instrumentOwners.has(note))

  for (const note of notes) {
    const owners = instrumentOwners.get(note) ?? new Set<string>()
    owners.add(event.triggerId)
    instrumentOwners.set(note, owners)
  }

  noteOwners.set(instrument, instrumentOwners)
  pendingTrigger.instrument = instrument

  if (notesToAttack.length > 0) {
    instrument.triggerAttack(notesToAttack, now)
  }
}

export function releaseVoicing(triggerId: string): void {
  const trigger = sustainedTriggers.get(triggerId)

  if (!trigger) {
    return
  }

  sustainedTriggers.delete(triggerId)

  if (!trigger.instrument) {
    return
  }

  const notesToRelease = new Set<string>()
  const instrumentOwners = noteOwners.get(trigger.instrument)

  for (const note of trigger.notes) {
    const owners = instrumentOwners?.get(note)

    if (!owners) {
      continue
    }

    owners.delete(triggerId)

    if (owners.size === 0) {
      instrumentOwners?.delete(note)
      notesToRelease.add(note)
    }
  }

  if (instrumentOwners?.size === 0) {
    noteOwners.delete(trigger.instrument)
  }

  if (!synth && !sampler) {
    return
  }

  if (notesToRelease.size === 0) {
    return
  }

  trigger.instrument.triggerRelease([...notesToRelease], Tone.now())
}

export function releaseAllVoicings(): void {
  for (const triggerId of [...sustainedTriggers.keys()]) {
    releaseVoicing(triggerId)
  }

  sustainedTriggers = new Map()
  noteOwners = new Map()
}

export function disposeAudio(): void {
  synth?.dispose()
  sampler?.dispose()
  synth = undefined
  sampler = undefined
  samplerUnavailable = false
  initPromise = undefined
  audioStarted = false
  warmupCleanup?.()
  sustainedTriggers = new Map()
  noteOwners = new Map()
}
