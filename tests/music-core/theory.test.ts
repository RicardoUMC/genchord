import { describe, expect, it } from 'vitest'
import { buildScale, noteNames, resolveDiatonicTriad } from '../../src/music-core'
import type { ChordQuality, DegreeNum, Key, NoteName, RomanNumeral } from '../../src/music-core'

interface ExpectedTriad {
  degree: RomanNumeral
  quality: ChordQuality
  notes: NoteName[]
}

interface ExpectedKey {
  key: Key
  scale: NoteName[]
}

const majorKeys: ExpectedKey[] = [
  { key: { root: 'C', tonality: 'major' }, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { key: { root: 'C#', tonality: 'major' }, scale: ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C'] },
  { key: { root: 'D', tonality: 'major' }, scale: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
  { key: { root: 'Eb', tonality: 'major' }, scale: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
  { key: { root: 'E', tonality: 'major' }, scale: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
  { key: { root: 'F', tonality: 'major' }, scale: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  { key: { root: 'F#', tonality: 'major' }, scale: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'] },
  { key: { root: 'G', tonality: 'major' }, scale: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
  { key: { root: 'Ab', tonality: 'major' }, scale: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
  { key: { root: 'A', tonality: 'major' }, scale: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
  { key: { root: 'Bb', tonality: 'major' }, scale: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  { key: { root: 'B', tonality: 'major' }, scale: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
]

const minorKeys: ExpectedKey[] = [
  { key: { root: 'C', tonality: 'minor' }, scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
  { key: { root: 'C#', tonality: 'minor' }, scale: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'] },
  { key: { root: 'D', tonality: 'minor' }, scale: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'] },
  { key: { root: 'Eb', tonality: 'minor' }, scale: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'B', 'Db'] },
  { key: { root: 'E', tonality: 'minor' }, scale: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
  { key: { root: 'F', tonality: 'minor' }, scale: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'] },
  { key: { root: 'F#', tonality: 'minor' }, scale: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'] },
  { key: { root: 'G', tonality: 'minor' }, scale: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'] },
  { key: { root: 'Ab', tonality: 'minor' }, scale: ['Ab', 'Bb', 'B', 'Db', 'Eb', 'E', 'Gb'] },
  { key: { root: 'A', tonality: 'minor' }, scale: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  { key: { root: 'Bb', tonality: 'minor' }, scale: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'] },
  { key: { root: 'B', tonality: 'minor' }, scale: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'] },
]

const majorTriadQualities: ChordQuality[] = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
const minorTriadQualities: ChordQuality[] = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
const majorRomanNumerals: RomanNumeral[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const minorRomanNumerals: RomanNumeral[] = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']

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
  it('builds the 12 prototype major scales', () => {
    majorKeys.forEach(({ key, scale }) => {
      expect(buildScale(key)).toEqual(scale)
    })
  })

  it('builds the 12 prototype natural minor scales', () => {
    minorKeys.forEach(({ key, scale }) => {
      expect(buildScale(key)).toEqual(scale)
    })
  })

  it('resolves triads for all 12 prototype major keys', () => {
    majorKeys.forEach(({ key, scale }) => {
      expectTriads(key, expectedTriads(scale, majorTriadQualities, majorRomanNumerals))
    })
  })

  it('resolves triads for all 12 prototype natural minor keys', () => {
    minorKeys.forEach(({ key, scale }) => {
      expectTriads(key, expectedTriads(scale, minorTriadQualities, minorRomanNumerals))
    })
  })

  it('keeps the diminished vii° edge case in major keys', () => {
    const chord = resolveDiatonicTriad({ root: 'C', tonality: 'major' }, 7)

    expect(chord).toMatchObject({ degree: 'vii°', quality: 'diminished', notes: ['B', 'D', 'F'] })
  })

  it('keeps the diminished ii° edge case in minor keys', () => {
    const chord = resolveDiatonicTriad({ root: 'A', tonality: 'minor' }, 2)

    expect(chord).toMatchObject({ degree: 'ii°', quality: 'diminished', notes: ['B', 'D', 'F'] })
  })

  it('formats chord note names for display consumers', () => {
    const chord = resolveDiatonicTriad({ root: 'C', tonality: 'major' }, 5)
    expect(noteNames(chord)).toBe('G · B · D')
  })
})
