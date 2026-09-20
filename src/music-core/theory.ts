import type { ChordQuality, ChordResult, DegreeNum, KeyboardToneResult, Key, Mode, NoteName, RomanNumeral, TriadInversion, TriadInversionLabel, VoicedNote } from './types'

const sharpChromatic: readonly NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const flatChromatic: readonly NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const naturalLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

type NaturalLetter = (typeof naturalLetters)[number]

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

const triadInversionLabels: Record<TriadInversion, TriadInversionLabel> = {
  root: 'root position',
  first: 'first inversion',
  second: 'second inversion',
}

const triadInversionRotations: Record<TriadInversion, number> = {
  root: 0,
  first: 1,
  second: 2,
}

const pitchClassByNaturalLetter: Record<NaturalLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
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

function rootLetter(note: NoteName): NaturalLetter {
  return note[0] as NaturalLetter
}

function transposeLetter(letter: NaturalLetter, steps: number): NaturalLetter {
  const index = naturalLetters.indexOf(letter)

  return naturalLetters[(index + steps) % naturalLetters.length]
}

function spellPitchForScaleDegree(letter: NaturalLetter, targetPitchClass: number, fallbackChromatic: readonly NoteName[]): NoteName {
  const naturalPitchClass = pitchClassByNaturalLetter[letter]
  const sharp = `${letter}#` as NoteName
  const flat = `${letter}b` as NoteName

  if (naturalPitchClass === targetPitchClass) {
    return letter
  }

  if (pitchClassByNote[sharp] === targetPitchClass) {
    return sharp
  }

  if (pitchClassByNote[flat] === targetPitchClass) {
    return flat
  }

  return fallbackChromatic[targetPitchClass]
}

function midiNumber({ note, octave }: VoicedNote): number {
  return (octave + 1) * 12 + pitchClass(note)
}

function isInsideVisibleKeyboardRange(note: VoicedNote): boolean {
  const noteMidi = midiNumber(note)

  return noteMidi >= midiNumber(visibleKeyboardRange.lowest) && noteMidi <= midiNumber(visibleKeyboardRange.highest)
}

export function buildScale(key: Key): NoteName[] {
  const rootPitchClass = pitchClass(key.root)
  const fallbackChromatic = key.root.includes('b') ? flatChromatic : sharpChromatic
  const steps = modeSteps[key.mode]

  return steps.map((step, degreeIndex) => {
    const letter = transposeLetter(rootLetter(key.root), degreeIndex)
    const targetPitchClass = (rootPitchClass + step) % 12

    return spellPitchForScaleDegree(letter, targetPitchClass, fallbackChromatic)
  })
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

function rootPositionGeneratorNote(chordNotes: NoteName[], startingOctave: number): VoicedNote {
  return voiceChordFrom(chordNotes, startingOctave)[0]
}

function applyInversionToVoicing(rootVoicing: VoicedNote[], inversion: TriadInversion): VoicedNote[] {
  if (inversion === 'root') return rootVoicing

  const rotation = triadInversionRotations[inversion]
  const rotated = [...rootVoicing.slice(rotation), ...rootVoicing.slice(0, rotation)]

  // Bump octave for notes that wrapped around
  for (let i = rotated.length - rotation; i < rotated.length; i++) {
    rotated[i] = { ...rotated[i], octave: rotated[i].octave + 1 }
  }

  return rotated
}

function applyInversionToNotes(notes: NoteName[], inversion: TriadInversion): NoteName[] {
  if (inversion === 'root') return notes

  const rotation = triadInversionRotations[inversion]

  return [...notes.slice(rotation), ...notes.slice(0, rotation)]
}

function voiceChordAroundAnchor(rotatedNotes: NoteName[], anchorNote: VoicedNote): VoicedNote[] {
  const anchorPitch = pitchClass(anchorNote.note)
  const anchorIndex = rotatedNotes.findIndex((n) => pitchClass(n) === anchorPitch)

  if (anchorIndex === -1) {
    // Fallback: voice upward from anchor octave if anchor pitch is not in chord
    return voiceChordFrom(rotatedNotes, anchorNote.octave)
  }

  const voicing: VoicedNote[] = new Array(rotatedNotes.length)

  voicing[anchorIndex] = { note: rotatedNotes[anchorIndex], octave: anchorNote.octave }

  // Expand upward (higher notes)
  for (let i = anchorIndex + 1; i < rotatedNotes.length; i++) {
    const note = rotatedNotes[i]
    let octave = voicing[i - 1].octave
    let noteMidi = midiNumber({ note, octave })
    const prevMidi = midiNumber(voicing[i - 1])

    while (noteMidi <= prevMidi) {
      octave += 1
      noteMidi = midiNumber({ note, octave })
    }

    voicing[i] = { note, octave }
  }

  // Expand downward (lower notes)
  for (let i = anchorIndex - 1; i >= 0; i--) {
    const note = rotatedNotes[i]
    let octave = voicing[i + 1].octave
    let noteMidi = midiNumber({ note, octave })
    const nextMidi = midiNumber(voicing[i + 1])

    while (noteMidi >= nextMidi) {
      octave -= 1
      noteMidi = midiNumber({ note, octave })
    }

    voicing[i] = { note, octave }
  }

  return voicing
}

function buildTriadResult(key: Key, degree: DegreeNum, startingOctave: number, inversion: TriadInversion): ChordResult {
  const scale = buildScale(key)
  const degreeIndex = degree - 1
  const notes = [scale[degreeIndex], scale[(degreeIndex + 2) % 7], scale[(degreeIndex + 4) % 7]]
  const quality = qualitiesByMode[key.mode][degreeIndex]

  const rootVoicing = voiceChordFrom(notes, startingOctave)
  const voicing = applyInversionToVoicing(rootVoicing, inversion)

  return {
    kind: 'chord',
    name: `${notes[0]} ${quality}`,
    degree: romansByMode[key.mode][degreeIndex],
    degreeNum: degree,
    quality,
    notes,
    inversion: triadInversionLabels[inversion],
    voicing,
    generatorNote: rootVoicing[0],
  }
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

export function resolveDiatonicTriad(key: Key, degree: DegreeNum, startingOctave = 4, inversion: TriadInversion = 'root'): ChordResult {
  return buildTriadResult(key, degree, startingOctave, inversion)
}

export function resolveKeyboardTone(note: VoicedNote): KeyboardToneResult {
  return {
    kind: 'keyboard-tone',
    name: `${note.note}${note.octave}`,
    voicing: [note],
    generatorNote: note,
  }
}

export function resolveVisibleKeyboardTriad(key: Key, degree: DegreeNum, anchorNote: VoicedNote, inversion: TriadInversion = 'root'): ChordResult {
  const scale = buildScale(key)
  const degreeIndex = degree - 1
  const notes = [scale[degreeIndex], scale[(degreeIndex + 2) % 7], scale[(degreeIndex + 4) % 7]]
  const quality = qualitiesByMode[key.mode][degreeIndex]

  const rotatedNotes = applyInversionToNotes(notes, inversion)
  const voicing = voiceChordAroundAnchor(rotatedNotes, anchorNote)
  const clippedVoicing = clipVoicingToVisibleKeyboard(voicing)

  return {
    kind: 'chord',
    name: `${notes[0]} ${quality}`,
    degree: romansByMode[key.mode][degreeIndex],
    degreeNum: degree,
    quality,
    notes,
    inversion: triadInversionLabels[inversion],
    voicing: clippedVoicing.length > 0 ? clippedVoicing : [anchorNote],
    generatorNote: anchorNote,
  }
}

export function noteNames(chord: ChordResult): string {
  return chord.notes.join(' · ')
}

export function voicingNames(result: { voicing: VoicedNote[] }): string {
  return result.voicing.map(({ note, octave }) => `${note}${octave}`).join(' · ')
}
