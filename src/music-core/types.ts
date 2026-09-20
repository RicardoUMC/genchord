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

export type Mode = 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian'
export type DegreeNum = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ChordQuality = 'major' | 'minor' | 'diminished'
export type TriadInversion = 'root' | 'first' | 'second'
export type TriadInversionLabel = 'root position' | 'first inversion' | 'second inversion'
export type RomanNumeral = 'I' | 'i' | 'ii' | 'ii°' | 'iii' | 'III' | 'IV' | 'iv' | 'V' | 'v' | 'vi' | 'vi°' | 'VI' | 'VII' | 'vii' | 'vii°' | 'i°' | 'v°' | 'iv°' | 'iii°' | 'II'

export interface Key {
  root: NoteName
  mode: Mode
}

export interface ChordResult {
  kind: 'chord'
  name: string
  degree: RomanNumeral
  degreeNum: DegreeNum
  quality: ChordQuality
  notes: NoteName[]
  inversion: TriadInversionLabel
  voicing: VoicedNote[]
  generatorNote: VoicedNote
}

export interface KeyboardToneResult {
  kind: 'keyboard-tone'
  name: string
  voicing: VoicedNote[]
  generatorNote: VoicedNote
}

export type StudyResult = ChordResult | KeyboardToneResult

export interface VoicedNote {
  note: NoteName
  octave: number
}

export interface PlaybackEvent {
  voicing: VoicedNote[]
}

export interface SustainedPlaybackEvent extends PlaybackEvent {
  triggerId: string
}
