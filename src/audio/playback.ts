import * as Tone from 'tone'
import type { PlaybackEvent } from '../music-core'

let synth: Tone.PolySynth<Tone.Synth<Tone.SynthOptions>> | undefined
let initPromise: Promise<void> | undefined
let activeNotes: string[] = []
let soundingNotes: string[] = []
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

export async function initAudio(): Promise<void> {
  initPromise ??= Tone.start().then(() => {
    getSynth()
  })

  return initPromise
}

export async function playVoicing(event: PlaybackEvent): Promise<void> {
  await initAudio()
  const notes = event.voicing.map(({ note, octave }) => `${note}${octave}`)
  getSynth().triggerAttackRelease(notes, '2n', Tone.now())
}

export async function startVoicing(event: PlaybackEvent): Promise<void> {
  const requestId = voicingRequestId + 1
  voicingRequestId = requestId
  const notes = event.voicing.map(({ note, octave }) => `${note}${octave}`)

  if (synth && soundingNotes.length > 0) {
    synth.triggerRelease(soundingNotes, Tone.now())
    soundingNotes = []
  }

  activeNotes = notes

  await initAudio()

  if (requestId !== voicingRequestId || activeNotes.length === 0) {
    return
  }

  const now = Tone.now()
  const instrument = getSynth()

  if (soundingNotes.length > 0) {
    instrument.triggerRelease(soundingNotes, now)
  }

  soundingNotes = notes
  instrument.triggerAttack(notes, now)
}

export function releaseVoicing(): void {
  voicingRequestId += 1

  if (!synth) {
    activeNotes = []
    soundingNotes = []
    return
  }

  const notesToRelease = soundingNotes.length > 0 ? soundingNotes : activeNotes

  if (notesToRelease.length === 0) {
    return
  }

  synth.triggerRelease(notesToRelease, Tone.now())
  activeNotes = []
  soundingNotes = []
}

export function disposeAudio(): void {
  synth?.dispose()
  synth = undefined
  initPromise = undefined
  activeNotes = []
  soundingNotes = []
  voicingRequestId = 0
}
