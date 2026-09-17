import * as Tone from 'tone'
import type { PlaybackEvent } from '../music-core'

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
let activeNotes: string[] = []
let soundingNotes: string[] = []
let soundingInstrument: PlaybackInstrument | undefined
let voicingRequestId = 0

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

export async function initAudio(): Promise<void> {
  initPromise ??= Tone.start().then(() => {
    getSynth()
    getSampler()
  })

  return initPromise
}

export async function playVoicing(event: PlaybackEvent): Promise<void> {
  await initAudio()
  const notes = event.voicing.map(({ note, octave }) => `${note}${octave}`)
  getInstrument().triggerAttackRelease(notes, '2n', Tone.now())
}

export async function startVoicing(event: PlaybackEvent): Promise<void> {
  const requestId = voicingRequestId + 1
  voicingRequestId = requestId
  const notes = event.voicing.map(({ note, octave }) => `${note}${octave}`)

  if (soundingInstrument && soundingNotes.length > 0) {
    soundingInstrument.triggerRelease(soundingNotes, Tone.now())
    soundingNotes = []
    soundingInstrument = undefined
  }

  activeNotes = notes

  await initAudio()

  if (requestId !== voicingRequestId || activeNotes.length === 0) {
    return
  }

  const now = Tone.now()
  const instrument = getInstrument()

  if (soundingNotes.length > 0) {
    instrument.triggerRelease(soundingNotes, now)
  }

  soundingNotes = notes
  soundingInstrument = instrument
  instrument.triggerAttack(notes, now)
}

export function releaseVoicing(): void {
  voicingRequestId += 1

  if (!synth && !sampler) {
    activeNotes = []
    soundingNotes = []
    soundingInstrument = undefined
    return
  }

  const notesToRelease = soundingNotes.length > 0 ? soundingNotes : activeNotes

  if (notesToRelease.length === 0) {
    return
  }

  const instrument = soundingInstrument ?? getInstrument()

  instrument.triggerRelease(notesToRelease, Tone.now())
  activeNotes = []
  soundingNotes = []
  soundingInstrument = undefined
}

export function disposeAudio(): void {
  synth?.dispose()
  sampler?.dispose()
  synth = undefined
  sampler = undefined
  samplerUnavailable = false
  initPromise = undefined
  activeNotes = []
  soundingNotes = []
  soundingInstrument = undefined
  voicingRequestId = 0
}
