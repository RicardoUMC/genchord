import { useReducer } from 'react'
import type { ChordResult, DegreeChordOctave, DegreeNum, Key, Mode, NoteName, StudyResult, TriadInversion } from '../music-core'

interface StudyState {
  root: NoteName | null
  mode: Mode | null
  autoChordsEnabled: boolean
  inversion: TriadInversion
  degreeChordOctave: DegreeChordOctave
  scaleGuideStyle: ScaleGuideStyle
  activeDegrees: DegreeNum[]
  activeStudy: StudyResult | null
  activeInputs: Record<string, StudyResult>
  guidance: string | null
}

export type ScaleGuideStyle = 'dim' | 'highlight'

type StudyAction =
  | { type: 'setRoot'; root: NoteName }
  | { type: 'setMode'; mode: Mode }
  | { type: 'toggleAutoChords' }
  | { type: 'setInversion'; inversion: TriadInversion }
  | { type: 'setDegreeChordOctave'; degreeChordOctave: DegreeChordOctave }
  | { type: 'setScaleGuideStyle'; scaleGuideStyle: ScaleGuideStyle }
  | { type: 'triggerChord'; triggerId: string; degree: DegreeNum; chord: ChordResult }
  | { type: 'triggerKeyboardTone'; triggerId: string; tone: StudyResult }
  | { type: 'releaseHeldInput'; triggerId: string }
  | { type: 'releaseAllInputs' }
  | { type: 'setGuidance'; guidance: string }

const initialState: StudyState = {
  root: null,
  mode: null,
  autoChordsEnabled: true,
  inversion: 'root',
  degreeChordOctave: 4,
  scaleGuideStyle: 'dim',
  activeDegrees: [],
  activeStudy: null,
  activeInputs: {},
  guidance: 'Choose a context, then trigger a degree or play the keyboard.',
}

function clearChord(state: StudyState): StudyState {
  return { ...state, activeDegrees: [], activeStudy: null, activeInputs: {} }
}

function activeDegreesFromInputs(activeInputs: Record<string, StudyResult>): DegreeNum[] {
  const degrees = new Set<DegreeNum>()

  for (const input of Object.values(activeInputs)) {
    if (input.kind === 'chord') {
      degrees.add(input.degreeNum)
    }
  }

  return Array.from(degrees)
}

function latestActiveStudy(activeInputs: Record<string, StudyResult>): StudyResult | null {
  const inputs = Object.values(activeInputs)

  return inputs[inputs.length - 1] ?? null
}

function reducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'setRoot':
      return clearChord({ ...state, root: action.root })
    case 'setMode':
      return clearChord({ ...state, mode: action.mode })
    case 'toggleAutoChords':
      return { ...state, autoChordsEnabled: !state.autoChordsEnabled }
    case 'setInversion':
      return clearChord({ ...state, inversion: action.inversion })
    case 'setDegreeChordOctave':
      return clearChord({ ...state, degreeChordOctave: action.degreeChordOctave })
    case 'setScaleGuideStyle':
      return { ...state, scaleGuideStyle: action.scaleGuideStyle }
    case 'triggerChord': {
      const activeInputs = { ...state.activeInputs, [action.triggerId]: action.chord }

      return { ...state, activeDegrees: activeDegreesFromInputs(activeInputs), activeStudy: action.chord, activeInputs, guidance: null }
    }
    case 'triggerKeyboardTone': {
      const activeInputs = { ...state.activeInputs, [action.triggerId]: action.tone }

      return { ...state, activeDegrees: activeDegreesFromInputs(activeInputs), activeStudy: action.tone, activeInputs, guidance: null }
    }
    case 'releaseHeldInput': {
      const { [action.triggerId]: _releasedInput, ...activeInputs } = state.activeInputs

      return { ...state, activeDegrees: activeDegreesFromInputs(activeInputs), activeStudy: latestActiveStudy(activeInputs) ?? state.activeStudy, activeInputs }
    }
    case 'releaseAllInputs':
      return { ...state, activeDegrees: [], activeInputs: {} }
    case 'setGuidance':
      return { ...state, guidance: action.guidance }
  }
}

export function useStudyState() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const activeKey: Key | null = state.root && state.mode ? { root: state.root, mode: state.mode } : null

  return { state, activeKey, dispatch }
}
