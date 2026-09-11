import { useReducer } from 'react'
import type { ChordResult, DegreeNum, Key, NoteName, Tonality } from '../music-core'

interface StudyState {
  root: NoteName | null
  tonality: Tonality | null
  activeDegree: DegreeNum | null
  activeChord: ChordResult | null
}

type StudyAction =
  | { type: 'setRoot'; root: NoteName }
  | { type: 'setTonality'; tonality: Tonality }
  | { type: 'triggerChord'; degree: DegreeNum; chord: ChordResult }

const initialState: StudyState = {
  root: null,
  tonality: null,
  activeDegree: null,
  activeChord: null,
}

function clearChord(state: StudyState): StudyState {
  return { ...state, activeDegree: null, activeChord: null }
}

function reducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'setRoot':
      return clearChord({ ...state, root: action.root })
    case 'setTonality':
      return clearChord({ ...state, tonality: action.tonality })
    case 'triggerChord':
      return { ...state, activeDegree: action.degree, activeChord: action.chord }
  }
}

export function useStudyState() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const activeKey: Key | null = state.root && state.tonality ? { root: state.root, tonality: state.tonality } : null

  return { state, activeKey, dispatch }
}
