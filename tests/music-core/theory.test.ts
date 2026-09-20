import { describe, expect, it } from 'vitest'
import {
  buildScale,
  clipVoicingToVisibleKeyboard,
  findDiatonicDegreeForNote,
  noteNames,
  resolveDiatonicTriad,
  resolveKeyboardTone,
  resolveVisibleKeyboardTriad,
  voicingNames,
} from '../../src/music-core'
import type { ChordQuality, DegreeNum, Key, Mode, NoteName, RomanNumeral } from '../../src/music-core'

interface ExpectedTriad {
  degree: RomanNumeral
  quality: ChordQuality
  notes: NoteName[]
}

interface ExpectedKey {
  key: Key
  scale: NoteName[]
}

const ionianKeys: ExpectedKey[] = [
  { key: { root: 'C', mode: 'ionian' }, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { key: { root: 'C#', mode: 'ionian' }, scale: ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C'] },
  { key: { root: 'D', mode: 'ionian' }, scale: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
  { key: { root: 'Eb', mode: 'ionian' }, scale: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
  { key: { root: 'E', mode: 'ionian' }, scale: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
  { key: { root: 'F', mode: 'ionian' }, scale: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  { key: { root: 'F#', mode: 'ionian' }, scale: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'] },
  { key: { root: 'G', mode: 'ionian' }, scale: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
  { key: { root: 'Ab', mode: 'ionian' }, scale: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
  { key: { root: 'A', mode: 'ionian' }, scale: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
  { key: { root: 'Bb', mode: 'ionian' }, scale: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  { key: { root: 'B', mode: 'ionian' }, scale: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
]

const aeolianKeys: ExpectedKey[] = [
  { key: { root: 'C', mode: 'aeolian' }, scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
  { key: { root: 'C#', mode: 'aeolian' }, scale: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'] },
  { key: { root: 'D', mode: 'aeolian' }, scale: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'] },
  { key: { root: 'Eb', mode: 'aeolian' }, scale: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'B', 'Db'] },
  { key: { root: 'E', mode: 'aeolian' }, scale: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
  { key: { root: 'F', mode: 'aeolian' }, scale: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'] },
  { key: { root: 'F#', mode: 'aeolian' }, scale: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'] },
  { key: { root: 'G', mode: 'aeolian' }, scale: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'] },
  { key: { root: 'Ab', mode: 'aeolian' }, scale: ['Ab', 'Bb', 'B', 'Db', 'Eb', 'E', 'Gb'] },
  { key: { root: 'A', mode: 'aeolian' }, scale: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  { key: { root: 'Bb', mode: 'aeolian' }, scale: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'] },
  { key: { root: 'B', mode: 'aeolian' }, scale: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'] },
]

const ionianTriadQualities: ChordQuality[] = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
const aeolianTriadQualities: ChordQuality[] = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
const ionianRomanNumerals: RomanNumeral[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const aeolianRomanNumerals: RomanNumeral[] = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']

const representativeModeKeys: ExpectedKey[] = [
  { key: { root: 'C', mode: 'ionian' }, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { key: { root: 'C', mode: 'dorian' }, scale: ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'] },
  { key: { root: 'C', mode: 'phrygian' }, scale: ['C', 'Db', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
  { key: { root: 'C', mode: 'lydian' }, scale: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'] },
  { key: { root: 'C', mode: 'mixolydian' }, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'] },
  { key: { root: 'C', mode: 'aeolian' }, scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
  { key: { root: 'C', mode: 'locrian' }, scale: ['C', 'Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb'] },
]

const triadQualitiesByMode: Record<Mode, ChordQuality[]> = {
  ionian: ionianTriadQualities,
  dorian: ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
  phrygian: ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
  lydian: ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
  mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
  aeolian: aeolianTriadQualities,
  locrian: ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'],
}

const romanNumeralsByMode: Record<Mode, RomanNumeral[]> = {
  ionian: ionianRomanNumerals,
  dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  phrygian: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  lydian: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
  mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  aeolian: aeolianRomanNumerals,
  locrian: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
}

function expectTriads(key: Key, expected: ExpectedTriad[]) {
  expected.forEach((triad, index) => {
    const chord = resolveDiatonicTriad(key, (index + 1) as DegreeNum)
    expect(chord.degree).toBe(triad.degree)
    expect(chord.quality).toBe(triad.quality)
    expect(chord.notes).toEqual(triad.notes)
  })
}

function expectedTriads(scale: NoteName[], qualities: ChordQuality[], numerals: RomanNumeral[]): ExpectedTriad[] {
  return scale.map((_, index) => ({
    degree: numerals[index],
    quality: qualities[index],
    notes: [scale[index], scale[(index + 2) % 7], scale[(index + 4) % 7]],
  }))
}

describe('music-core theory', () => {
  it('builds the 12 prototype ionian (major) scales', () => {
    ionianKeys.forEach(({ key, scale }) => {
      expect(buildScale(key)).toEqual(scale)
    })
  })

  it('builds the 12 prototype aeolian (natural minor) scales', () => {
    aeolianKeys.forEach(({ key, scale }) => {
      expect(buildScale(key)).toEqual(scale)
    })
  })

  it('spells representative roots for all seven diatonic modes', () => {
    representativeModeKeys.forEach(({ key, scale }) => {
      expect(buildScale(key)).toEqual(scale)
    })
  })

  it('resolves triads for all 12 prototype ionian keys', () => {
    ionianKeys.forEach(({ key, scale }) => {
      expectTriads(key, expectedTriads(scale, ionianTriadQualities, ionianRomanNumerals))
    })
  })

  it('resolves triads for all 12 prototype aeolian keys', () => {
    aeolianKeys.forEach(({ key, scale }) => {
      expectTriads(key, expectedTriads(scale, aeolianTriadQualities, aeolianRomanNumerals))
    })
  })

  it('resolves triads for representative roots in all seven diatonic modes', () => {
    representativeModeKeys.forEach(({ key, scale }) => {
      expectTriads(key, expectedTriads(scale, triadQualitiesByMode[key.mode], romanNumeralsByMode[key.mode]))
    })
  })

  it('keeps the diminished vii° edge case in ionian keys', () => {
    const chord = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 7)

    expect(chord).toMatchObject({ degree: 'vii°', quality: 'diminished', notes: ['B', 'D', 'F'] })
  })

  it('keeps the diminished ii° edge case in aeolian keys', () => {
    const chord = resolveDiatonicTriad({ root: 'A', mode: 'aeolian' }, 2)

    expect(chord).toMatchObject({ degree: 'ii°', quality: 'diminished', notes: ['B', 'D', 'F'] })
  })

  it('formats chord note names for display consumers', () => {
    const chord = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 5)
    expect(noteNames(chord)).toBe('G · B · D')
  })

  it('voices degree-triggered chords upward from C4 register by default', () => {
    const chord = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 5)

    expect(voicingNames(chord)).toBe('G4 · B4 · D5')
  })

  it('voices degree-triggered chords from the requested register', () => {
    const lowRegister = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 5, 3)
    const highRegister = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 5, 5)

    expect(voicingNames(lowRegister)).toBe('G3 · B3 · D4')
    expect(voicingNames(highRegister)).toBe('G5 · B5 · D6')
  })

  it('keeps chord identity while applying first and second inversion voicings', () => {
    const firstInversion = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 1, 4, 'first')
    const secondInversion = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 1, 4, 'second')

    expect(firstInversion).toMatchObject({ name: 'C major', degree: 'I', quality: 'major', notes: ['C', 'E', 'G'], inversion: 'first inversion' })
    expect(voicingNames(firstInversion)).toBe('E4 · G4 · C5')
    expect(firstInversion.generatorNote).toEqual({ note: 'C', octave: 4 })
    expect(secondInversion).toMatchObject({ name: 'C major', degree: 'I', quality: 'major', notes: ['C', 'E', 'G'], inversion: 'second inversion' })
    expect(voicingNames(secondInversion)).toBe('G4 · C5 · E5')
    expect(secondInversion.generatorNote).toEqual({ note: 'C', octave: 4 })
  })

  it('inverts from the root-position voicing so high-root chords do not drop octaves', () => {
    const firstInversion = resolveDiatonicTriad({ root: 'C', mode: 'ionian' }, 6, 4, 'first')

    expect(firstInversion).toMatchObject({ name: 'A minor', degree: 'vi', quality: 'minor', notes: ['A', 'C', 'E'], inversion: 'first inversion' })
    expect(voicingNames(firstInversion)).toBe('C5 · E5 · A5')
    expect(firstInversion.generatorNote).toEqual({ note: 'A', octave: 4 })
  })

  it('finds a clicked keyboard note degree in the current key by pitch class', () => {
    expect(findDiatonicDegreeForNote({ root: 'C', mode: 'ionian' }, 'D')).toBe(2)
    expect(findDiatonicDegreeForNote({ root: 'C', mode: 'ionian' }, 'C#')).toBeNull()
  })

  it('clips high keyboard-triggered triads to available notes without octave fallback', () => {
    expect(clipVoicingToVisibleKeyboard([{ note: 'B', octave: 5 }, { note: 'D', octave: 6 }, { note: 'F', octave: 6 }])).toEqual([{ note: 'B', octave: 5 }])
    expect(clipVoicingToVisibleKeyboard([{ note: 'C', octave: 6 }, { note: 'E', octave: 6 }, { note: 'G', octave: 6 }])).toEqual([{ note: 'C', octave: 6 }])

    const chord = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 7, { note: 'B', octave: 5 })

    expect(voicingNames(chord)).toBe('B5')
    expect(chord.generatorNote).toEqual({ note: 'B', octave: 5 })
  })

  it('keeps only the selected C6 generator note when the rest of the triad is above the keyboard', () => {
    const chord = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 1, { note: 'C', octave: 6 })

    expect(chord.notes).toEqual(['C', 'E', 'G'])
    expect(voicingNames(chord)).toBe('C6')
    expect(chord.generatorNote).toEqual({ note: 'C', octave: 6 })
  })

  it('keeps low and middle keyboard-triggered triads at the requested visible register', () => {
    const chord = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 2, { note: 'D', octave: 4 })

    expect(voicingNames(chord)).toBe('D4 · F4 · A4')
  })

  it('anchors keyboard triads around the pressed key for inversions', () => {
    const firstInversion = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 1, { note: 'C', octave: 4 }, 'first')
    const secondInversion = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 1, { note: 'C', octave: 4 }, 'second')

    expect(firstInversion.notes).toEqual(['C', 'E', 'G'])
    expect(firstInversion.inversion).toBe('first inversion')
    expect(voicingNames(firstInversion)).toBe('E3 · G3 · C4')
    expect(firstInversion.generatorNote).toEqual({ note: 'C', octave: 4 })

    expect(secondInversion.notes).toEqual(['C', 'E', 'G'])
    expect(secondInversion.inversion).toBe('second inversion')
    expect(voicingNames(secondInversion)).toBe('G3 · C4 · E4')
    expect(secondInversion.generatorNote).toEqual({ note: 'C', octave: 4 })
  })

  it('anchors keyboard triad inversions to the clicked note even when it is not the root', () => {
    const chord = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 2, { note: 'D', octave: 4 }, 'first')

    expect(chord.notes).toEqual(['D', 'F', 'A'])
    expect(chord.inversion).toBe('first inversion')
    expect(voicingNames(chord)).toBe('F3 · A3 · D4')
    expect(chord.generatorNote).toEqual({ note: 'D', octave: 4 })
  })

  it('keeps an inverted visual-keyboard chord anchored when the voicing clips out of range', () => {
    const chord = resolveVisibleKeyboardTriad({ root: 'C', mode: 'ionian' }, 1, { note: 'C', octave: 6 }, 'first')

    expect(chord.notes).toEqual(['C', 'E', 'G'])
    expect(chord.inversion).toBe('first inversion')
    expect(voicingNames(chord)).toBe('E5 · G5 · C6')
    expect(chord.generatorNote).toEqual({ note: 'C', octave: 6 })
  })

  it('resolves a visual keyboard tone as a single playable note', () => {
    const tone = resolveKeyboardTone({ note: 'C#', octave: 4 })

    expect(tone).toEqual({
      kind: 'keyboard-tone',
      name: 'C#4',
      voicing: [{ note: 'C#', octave: 4 }],
      generatorNote: { note: 'C#', octave: 4 },
    })
    expect(voicingNames(tone)).toBe('C#4')
  })
})
