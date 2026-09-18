import { useReducer } from 'react'
import type { ChordResult, DegreeNum, Key, Mode, NoteName, StudyResult } from '../music-core'

interface StudyState {
  root: NoteName | null
  mode: Mode | null
  autoChordsEnabled: boolean
  scaleGuideStyle: ScaleGuideStyle
  activeDegree: DegreeNum | null
  activeStudy: StudyResult | null
  activeInputs: Record<string, StudyResult>
  guidance: string | null
}

export type ScaleGuideStyle = 'dim' | 'highlight'

type StudyAction =
  | { type: 'setRoot'; root: NoteName }
  | { type: 'setMode'; mode: Mode }
  | { type: 'toggleAutoChords' }
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
  scaleGuideStyle: 'dim',
  activeDegree: null,
  activeStudy: null,
  activeInputs: {},
  guidance: 'Choose a context, then trigger a degree or play the keyboard.',
}

function clearChord(state: StudyState): StudyState {
  return { ...state, activeDegree: null, activeStudy: null, activeInputs: {} }
}

function latestActiveDegree(activeInputs: Record<string, StudyResult>): DegreeNum | null {
  const activeChords = Object.values(activeInputs).filter((input): input is ChordResult => input.kind === 'chord')

  return activeChords[activeChords.length - 1]?.degreeNum ?? null
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
    case 'setScaleGuideStyle':
      return { ...state, scaleGuideStyle: action.scaleGuideStyle }
    case 'triggerChord':
      return { ...state, activeDegree: action.degree, activeStudy: action.chord, activeInputs: { ...state.activeInputs, [action.triggerId]: action.chord }, guidance: null }
    case 'triggerKeyboardTone':
      return { ...state, activeDegree: latestActiveDegree(state.activeInputs), activeStudy: action.tone, activeInputs: { ...state.activeInputs, [action.triggerId]: action.tone }, guidance: null }
    case 'releaseHeldInput': {
      const { [action.triggerId]: _releasedInput, ...activeInputs } = state.activeInputs

      return { ...state, activeDegree: latestActiveDegree(activeInputs), activeStudy: latestActiveStudy(activeInputs) ?? state.activeStudy, activeInputs }
    }
    case 'releaseAllInputs':
      return { ...state, activeDegree: null, activeInputs: {} }
    case 'setGuidance':
      return { ...state, guidance: action.guidance }
  }
}

export function useStudyState() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const activeKey: Key | null = state.root && state.mode ? { root: state.root, mode: state.mode } : null

  return { state, activeKey, dispatch }
}
