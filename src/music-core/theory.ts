import type { ChordQuality, ChordResult, DegreeNum, KeyboardToneResult, Key, Mode, NoteName, RomanNumeral, VoicedNote } from './types'

const sharpChromatic: readonly NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const flatChromatic: readonly NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const modeSteps: Record<Mode, readonly number[]> = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
}

const qualitiesByMode: Record<Mode, readonly ChordQuality[]> = {
  ionian: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  dorian: ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
  phrygian: ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
  lydian: ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
  mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
  aeolian: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  locrian: ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'],
}

const romansByMode: Record<Mode, readonly RomanNumeral[]> = {
  ionian: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  phrygian: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  lydian: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
  mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  aeolian: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  locrian: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
}

const flatModeRoots: Record<Mode, Set<NoteName>> = {
  ionian: new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']),
  dorian: new Set(['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'C', 'F']),
  phrygian: new Set(['Ab', 'Db', 'Gb', 'C', 'F', 'Bb', 'Eb']),
  lydian: new Set(['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']),
  mixolydian: new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'C']),
  aeolian: new Set(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']),
  locrian: new Set(['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'C', 'F']),
}

const pitchClassByNote: Record<NoteName, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const visibleKeyboardRange = {
  lowest: { note: 'C', octave: 3 } as VoicedNote,
  highest: { note: 'C', octave: 6 } as VoicedNote,
}

function pitchClass(note: NoteName): number {
  return pitchClassByNote[note]
}

function midiNumber({ note, octave }: VoicedNote): number {
  return (octave + 1) * 12 + pitchClass(note)
}

function isInsideVisibleKeyboardRange(note: VoicedNote): boolean {
  const noteMidi = midiNumber(note)

  return noteMidi >= midiNumber(visibleKeyboardRange.lowest) && noteMidi <= midiNumber(visibleKeyboardRange.highest)
}

export function buildScale(key: Key): NoteName[] {
  const useFlatSpelling = flatModeRoots[key.mode].has(key.root)
  const chromatic = useFlatSpelling ? flatChromatic : sharpChromatic
  const rootIndex = chromatic.indexOf(key.root)
  if (rootIndex === -1) {
    throw new Error(`Unsupported root note: ${key.root}`)
  }

  const steps = modeSteps[key.mode]
  return steps.map((step) => chromatic[(rootIndex + step) % chromatic.length])
}

export function voiceChordFrom(chordNotes: NoteName[], startingOctave = 4): VoicedNote[] {
  let octave = startingOctave
  let previousPitch = -1

  return chordNotes.map((note) => {
    const notePitch = pitchClass(note)
    if (previousPitch >= 0 && notePitch <= previousPitch) {
      octave += 1
    }

    previousPitch = notePitch
    return { note, octave }
  })
}

export function clipVoicingToVisibleKeyboard(voicing: VoicedNote[]): VoicedNote[] {
  return voicing.filter(isInsideVisibleKeyboardRange)
}

export function findDiatonicDegreeForNote(key: Key, note: NoteName): DegreeNum | null {
  const scale = buildScale(key)
  const notePitch = pitchClass(note)
  const index = scale.findIndex((scaleNote) => pitchClass(scaleNote) === notePitch)

  return index === -1 ? null : ((index + 1) as DegreeNum)
}

export function resolveDiatonicTriad(key: Key, degree: DegreeNum, startingOctave = 4): ChordResult {
  const scale = buildScale(key)
  const degreeIndex = degree - 1
  const notes = [scale[degreeIndex], scale[(degreeIndex + 2) % 7], scale[(degreeIndex + 4) % 7]]
  const quality = qualitiesByMode[key.mode][degreeIndex]

  const voicing = voiceChordFrom(notes, startingOctave)

  return {
    kind: 'chord',
    name: `${notes[0]} ${quality}`,
    degree: romansByMode[key.mode][degreeIndex],
    degreeNum: degree,
    quality,
    notes,
    inversion: 'root position',
    voicing,
    generatorNote: voicing[0],
  }
}

export function resolveKeyboardTone(note: VoicedNote): KeyboardToneResult {
  return {
    kind: 'keyboard-tone',
    name: `${note.note}${note.octave}`,
    voicing: [note],
    generatorNote: note,
  }
}

export function resolveVisibleKeyboardTriad(key: Key, degree: DegreeNum, requestedOctave: number): ChordResult {
  const scale = buildScale(key)
  const degreeIndex = degree - 1
  const notes = [scale[degreeIndex], scale[(degreeIndex + 2) % 7], scale[(degreeIndex + 4) % 7]]
  const voicing = clipVoicingToVisibleKeyboard(voiceChordFrom(notes, requestedOctave))

  return {
    kind: 'chord',
    name: `${notes[0]} ${qualitiesByMode[key.mode][degreeIndex]}`,
    degree: romansByMode[key.mode][degreeIndex],
    degreeNum: degree,
    quality: qualitiesByMode[key.mode][degreeIndex],
    notes,
    inversion: 'root position',
    voicing,
    generatorNote: voicing[0],
  }
}

export function noteNames(chord: ChordResult): string {
  return chord.notes.join(' · ')
}

export function voicingNames(result: { voicing: VoicedNote[] }): string {
  return result.voicing.map(({ note, octave }) => `${note}${octave}`).join(' · ')
}
