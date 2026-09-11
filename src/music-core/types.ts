export type NaturalNoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type NoteName =
  | NaturalNoteName
  | 'C#'
  | 'Db'
  | 'D#'
  | 'Eb'
  | 'F#'
  | 'Gb'
  | 'G#'
  | 'Ab'
  | 'A#'
  | 'Bb'

export type Tonality = 'major' | 'minor'
export type DegreeNum = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ChordQuality = 'major' | 'minor' | 'diminished'
export type RomanNumeral = 'I' | 'i' | 'ii' | 'ii°' | 'iii' | 'III' | 'IV' | 'iv' | 'V' | 'v' | 'vi' | 'VI' | 'VII' | 'vii°'

export interface Key {
  root: NoteName
  tonality: Tonality
}

export interface ChordResult {
  name: string
  degree: RomanNumeral
  degreeNum: DegreeNum
  quality: ChordQuality
  notes: NoteName[]
}

export interface PlaybackEvent {
  notes: NoteName[]
  octave: 4
}
