import type { ChordInfo, ChordQuality, ChordResult, DegreeNum, KeyboardToneResult, Key, Mode, ModeContext, Note, NoteName, RomanNumeral, TriadInversion, TriadInversionLabel, VoicedNote } from './types'

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
  'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
}

const qualitiesByMode: Record<Mode, readonly ChordQuality[]> = {
  ionian: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  dorian: ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
  phrygian: ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
  lydian: ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
  mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
  aeolian: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  locrian: ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'],
  'harmonic-minor': ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'],
  'melodic-minor': ['minor', 'minor', 'augmented', 'major', 'major', 'diminished', 'diminished'],
}

const romansByMode: Record<Mode, readonly RomanNumeral[]> = {
  ionian: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  phrygian: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  lydian: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
  mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  aeolian: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  locrian: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
  'harmonic-minor': ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
  'melodic-minor': ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'],
}

const modeContexts: Record<Mode, ModeContext> = {
  ionian: {
    name: 'Ionian (Major)',
    description: 'Ionian is the major scale: bright, stable, and strongly resolved around the tonic. Its natural 3rd and 7th make the I and V-I pull feel direct and familiar.',
    characteristicNote: 'Natural 7̂ leading tone against the tonic; ♮3 gives the major color.',
    examples: [
      { song: 'Let It Be', artist: 'The Beatles' },
      { song: 'Here Comes the Sun', artist: 'The Beatles' },
      { song: 'Happy', artist: 'Pharrell Williams' },
    ],
    progressions: ['I-V-vi-IV', 'I-IV-V', 'ii-V-I'],
  },
  dorian: {
    name: 'Dorian',
    description: 'Dorian is a minor mode with a raised 6th, so it keeps minor depth without the darker pull of natural minor. The i-IV motion is its clearest signature.',
    characteristicNote: '♮6 vs Aeolian ♭6.',
    examples: [
      { song: 'So What', artist: 'Miles Davis' },
      { song: 'Scarborough Fair', artist: 'Simon & Garfunkel' },
      { song: 'Oye Como Va', artist: 'Santana' },
    ],
    progressions: ['i-IV', 'i-ii-IV-i', 'i-v-VII-IV'],
  },
  phrygian: {
    name: 'Phrygian',
    description: 'Phrygian is a minor mode defined by the half-step above the tonic. Its flat 2nd creates a tense, Spanish or Middle Eastern edge.',
    characteristicNote: '♭2 above the tonic.',
    examples: [
      { song: 'Wherever I May Roam', artist: 'Metallica' },
      { song: 'White Rabbit', artist: 'Jefferson Airplane' },
      { song: 'Set the Controls for the Heart of the Sun', artist: 'Pink Floyd' },
    ],
    progressions: ['i-II', 'i-♭II-i', 'i-vii-♭II-i'],
  },
  lydian: {
    name: 'Lydian',
    description: 'Lydian is a major mode with a raised 4th, giving it an open, floating sound. The tonic major chord feels stable while the #4 removes the usual pull toward V.',
    characteristicNote: '#4 vs Ionian natural 4.',
    examples: [
      { song: 'Flying in a Blue Dream', artist: 'Joe Satriani' },
      { song: 'Man on the Moon', artist: 'R.E.M.' },
      { song: 'Maria', artist: 'Leonard Bernstein' },
    ],
    progressions: ['I-II', 'I-V-II-I', 'I-II-V-I'],
  },
  mixolydian: {
    name: 'Mixolydian',
    description: 'Mixolydian is a major mode with a flat 7th, making it bright but less resolved than Ionian. It is common in blues, rock, folk, and dominant grooves.',
    characteristicNote: '♭7 vs Ionian natural 7.',
    examples: [
      { song: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd' },
      { song: 'Norwegian Wood', artist: 'The Beatles' },
      { song: 'Clocks', artist: 'Coldplay' },
    ],
    progressions: ['I-♭VII-IV', 'I-v-IV', 'I-IV-♭VII-I'],
  },
  aeolian: {
    name: 'Aeolian (Natural Minor)',
    description: 'Aeolian is natural minor: dark, familiar, and centered by ♭3, ♭6, and ♭7. Its minor v and major VI/VII avoid the stronger harmonic-minor leading tone.',
    characteristicNote: '♭6 vs Dorian natural 6.',
    examples: [
      { song: 'All Along the Watchtower', artist: 'Bob Dylan' },
      { song: 'Losing My Religion', artist: 'R.E.M.' },
      { song: 'Somebody That I Used to Know', artist: 'Gotye' },
    ],
    progressions: ['i-VI-VII', 'i-VII-VI-VII', 'i-iv-v'],
  },
  locrian: {
    name: 'Locrian',
    description: 'Locrian is the unstable diminished mode, with both a flat 2nd and flat 5th against the tonic. Because the tonic triad is diminished, it rarely acts as a long-term tonal home.',
    characteristicNote: '♭5 against the tonic triad, plus ♭2.',
    examples: [
      { song: 'Army of Me', artist: 'Björk' },
      { song: 'Juice Box', artist: 'The Strokes' },
      { song: 'YYZ', artist: 'Rush' },
    ],
    progressions: ['i°-II', 'i°-iv-II', 'i°-VI-V'],
  },
  'harmonic-minor': {
    name: 'Harmonic Minor',
    description: 'Harmonic minor raises the 7th degree of natural minor to create a leading tone and a major V chord. The augmented 2nd between ♭6 and 7 gives it a dramatic, classical minor color.',
    characteristicNote: 'Natural 7̂ in minor, creating V and vii°.',
    examples: [
      { song: 'Hava Nagila', artist: 'Traditional' },
      { song: 'Misirlou', artist: 'Dick Dale' },
      { song: 'Toxicity', artist: 'System of a Down' },
    ],
    progressions: ['i-iv-V', 'i-VI-V', 'ii°-V-i'],
  },
  'melodic-minor': {
    name: 'Melodic Minor',
    description: 'Melodic minor raises both the 6th and 7th degrees of natural minor, smoothing the line into the tonic. In modern use it also supplies bright minor tonic colors and altered dominant resources.',
    characteristicNote: 'Natural 6̂ and 7̂ in a minor tonic context.',
    examples: [
      { song: 'Nardis', artist: 'Miles Davis' },
      { song: 'Yesterday', artist: 'The Beatles' },
      { song: 'Caravan', artist: 'Duke Ellington' },
    ],
    progressions: ['i-IV-V', 'i-ii-V', 'i-VI°-V'],
  },
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

export function getModeContext(mode: Mode): ModeContext {
  return modeContexts[mode]
}

export function getDiatonicChords(key: Note, mode: Mode): ChordInfo[] {
  const scale = buildScale({ root: key, mode })

  return scale.map((root, index) => {
    const notes = [root, scale[(index + 2) % 7], scale[(index + 4) % 7]]
    const quality = qualitiesByMode[mode][index]

    return {
      name: `${root} ${quality}`,
      degree: romansByMode[mode][index],
      degreeNum: (index + 1) as DegreeNum,
      quality,
      notes,
    }
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
  const clippedInvertedVoicing = clipVoicingToVisibleKeyboard(applyInversionToVoicing(rootVoicing, inversion))
  const voicing = clippedInvertedVoicing.length > 0 ? clippedInvertedVoicing : clipVoicingToVisibleKeyboard(rootVoicing)

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
