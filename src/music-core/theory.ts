import type { ChordQuality, ChordResult, DegreeNum, Key, NoteName, RomanNumeral, Tonality } from './types'

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

export function resolveDiatonicTriad(key: Key, degree: DegreeNum): ChordResult {
  const scale = buildScale(key)
  const degreeIndex = degree - 1
  const notes = [scale[degreeIndex], scale[(degreeIndex + 2) % 7], scale[(degreeIndex + 4) % 7]]
  const quality = qualitiesByTonality[key.tonality][degreeIndex]

  return {
    name: `${notes[0]} ${quality}`,
    degree: romansByQuality[key.tonality][degreeIndex],
    degreeNum: degree,
    quality,
    notes,
  }
}

export function noteNames(chord: ChordResult): string {
  return chord.notes.join(' · ')
}
