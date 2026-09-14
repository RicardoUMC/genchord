import type { ChordQuality, ChordResult, DegreeNum, KeyboardToneResult, Key, NoteName, RomanNumeral, Tonality, VoicedNote } from './types'

const sharpChromatic: readonly NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const flatChromatic: readonly NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const majorSteps = [0, 2, 4, 5, 7, 9, 11] as const
const naturalMinorSteps = [0, 2, 3, 5, 7, 8, 10] as const
const qualitiesByTonality: Record<Tonality, readonly ChordQuality[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
}
const romansByQuality: Record<Tonality, readonly RomanNumeral[]> = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as readonly RomanNumeral[],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as readonly RomanNumeral[],
}
const flatMajorRoots = new Set<NoteName>(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'])
const flatMinorRoots = new Set<NoteName>(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'])
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
  const useFlatSpelling = key.tonality === 'major' ? flatMajorRoots.has(key.root) : flatMinorRoots.has(key.root)
  const chromatic = useFlatSpelling ? flatChromatic : sharpChromatic
  const rootIndex = chromatic.indexOf(key.root)
  if (rootIndex === -1) {
    throw new Error(`Unsupported root note: ${key.root}`)
  }

  const steps = key.tonality === 'major' ? majorSteps : naturalMinorSteps
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
  const quality = qualitiesByTonality[key.tonality][degreeIndex]

  const voicing = voiceChordFrom(notes, startingOctave)

  return {
    kind: 'chord',
    name: `${notes[0]} ${quality}`,
    degree: romansByQuality[key.tonality][degreeIndex],
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
    name: `${notes[0]} ${qualitiesByTonality[key.tonality][degreeIndex]}`,
    degree: romansByQuality[key.tonality][degreeIndex],
    degreeNum: degree,
    quality: qualitiesByTonality[key.tonality][degreeIndex],
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
