import { useReducer } from 'react'
import type { ChordResult, DegreeNum, Key, NoteName, StudyResult, Tonality } from '../music-core'

interface StudyState {
  root: NoteName | null
  tonality: Tonality | null
  activeDegree: DegreeNum | null
  activeStudy: StudyResult | null
  guidance: string | null
}

type StudyAction =
  | { type: 'setRoot'; root: NoteName }
  | { type: 'setTonality'; tonality: Tonality }
  | { type: 'triggerChord'; degree: DegreeNum; chord: ChordResult }
  | { type: 'triggerKeyboardTone'; tone: StudyResult }
  | { type: 'setGuidance'; guidance: string }

const initialState: StudyState = {
  root: null,
  tonality: null,
  activeDegree: null,
  activeStudy: null,
  guidance: 'Choose a context, then trigger a degree or play the keyboard.',
}

function clearChord(state: StudyState): StudyState {
  return { ...state, activeDegree: null, activeStudy: null }
}

function reducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'setRoot':
      return clearChord({ ...state, root: action.root })
    case 'setTonality':
      return clearChord({ ...state, tonality: action.tonality })
    case 'triggerChord':
      return { ...state, activeDegree: action.degree, activeStudy: action.chord, guidance: null }
    case 'triggerKeyboardTone':
      return { ...state, activeDegree: null, activeStudy: action.tone, guidance: null }
    case 'setGuidance':
      return { ...state, guidance: action.guidance }
  }
}

export function useStudyState() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const activeKey: Key | null = state.root && state.tonality ? { root: state.root, tonality: state.tonality } : null

  return { state, activeKey, dispatch }
}
