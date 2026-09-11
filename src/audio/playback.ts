import * as Tone from 'tone'
import type { PlaybackEvent } from '../music-core'

let synth: Tone.PolySynth<Tone.Synth<Tone.SynthOptions>> | undefined
let initPromise: Promise<void> | undefined

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

export async function playChord(event: PlaybackEvent): Promise<void> {
  await initAudio()
  const notes = event.notes.map((note) => `${note}${event.octave}`)
  getSynth().triggerAttackRelease(notes, '2n', Tone.now())
}

export function disposeAudio(): void {
  synth?.dispose()
  synth = undefined
  initPromise = undefined
}
