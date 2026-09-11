# Design: First Interactive Prototype

## Technical Approach

Build a minimal Vite + React + TypeScript app with three decoupled layers (`music-core`, `audio`, `ui`) per `docs/technical-direction.md`. The `music-core` provides pure functions for scale/degree/chord resolution (wrapping `tonal.js` behind a local boundary). The `audio` layer uses Tone.js for chord playback, receiving pre-resolved musical events. The `ui` layer manages study state (active key, triggered degree) and renders the tonality selector, degree buttons, chord display, and keyboard visualization. All specs are satisfied by this MVP scope.

## Architecture Decisions

### Decision: App Scaffold (Vite + React + TypeScript)

**Choice**: Vite + React 18 + TypeScript strict mode
**Alternatives considered**: Next.js, vanilla TS + Vite
**Rationale**: Vite gives fastest prototype iteration; React fits interactive visualization; TypeScript helps model musical domain. Next.js adds unnecessary routing overhead for a single-page study tool.

### Decision: Music Theory Library Boundary

**Choice**: Wrap `tonal.js` behind `music-core` facade (e.g., `src/music-core/theory.ts`)
**Alternatives considered**: Use `tonal.js` directly in UI, build own core from scratch
**Rationale**: Boundary isolates domain vocabulary (note, degree, quality, inversion) from library API changes. `tonal.js` handles spelling/interval math; we expose only GenChord types. Own core deferred until prototype validates requirements.

### Decision: Audio Layer (Tone.js)

**Choice**: Tone.js `PolySynth` with simple envelope, triggered via `Tone.start()` on first user gesture
**Alternatives considered**: Raw Web Audio API, Web Audio `AudioWorklet`
**Rationale**: Tone.js handles scheduling, polyphony, and AudioContext resume automatically. Meets <50ms latency target. Raw Web Audio adds boilerplate; AudioWorklet is overkill for simple triads.

### Decision: State Management

**Choice**: React `useState` + `useReducer` for study state (active key, active degree, display state)
**Alternatives considered**: Zustand, Redux, Context
**Rationale**: State is simple (two domain objects + UI flags). Built-in hooks avoid extra dependency. If state grows, migrate to Zustand.

### Decision: Keyboard Mapping

**Choice**: Physical keys `1-7` → degrees I-VII; `KeyQ-KeyU` (top row) as alternative
**Alternatives considered**: MIDI input, full piano key mapping
**Rationale**: Spec requires degree triggering via keyboard. `1-7` is intuitive, no MIDI hardware needed. MIDI deferred to post-MVP.

## Data Flow

```
User Action (UI)
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│  ui/state.ts     │────▶│  music-core/     │
│  (activeKey,     │     │  theory.ts       │
│   activeDegree)  │     │  resolveChord()  │
└──────────────────┘     └────────┬─────────┘
                                  │ ChordResult
                                  ▼
                        ┌──────────────────┐
                        │  ui/             │
                        │  ChordDisplay    │
                        │  KeyboardViz     │
                        └────────┬─────────┘
                                 │ PlaybackEvent
                                 ▼
                        ┌──────────────────┐
                        │  audio/          │
                        │  playback.ts     │
                        │  playChord()     │
                        └──────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | Vite + React + TS deps; Tone.js, tonal.js, Vitest |
| `vite.config.ts` | Create | Vite config with React plugin, path aliases |
| `tsconfig.json` | Create | Strict TS config, path mapping |
| `index.html` | Create | Entry HTML |
| `src/main.tsx` | Create | React bootstrap |
| `src/App.tsx` | Create | Root component, composes UI layers |
| `src/music-core/types.ts` | Create | Domain types: Note, Key, Degree, ChordQuality, ChordResult, PlaybackEvent |
| `src/music-core/theory.ts` | Create | Pure functions: `buildScale()`, `resolveDiatonicTriad()`, `noteNames()`; wraps tonal.js |
| `src/music-core/index.ts` | Create | Public barrel export for music-core |
| `src/audio/playback.ts` | Create | Tone.js setup, `initAudio()`, `playChord(event: PlaybackEvent)` |
| `src/audio/index.ts` | Create | Barrel export |
| `src/ui/state.ts` | Create | `useStudyState` reducer: activeKey, activeDegree, displayCleared |
| `src/ui/components/KeySelector.tsx` | Create | Root note dropdown + major/minor toggle |
| `src/ui/components/DegreeButtons.tsx` | Create | 7 buttons I-VII, keyboard handlers (1-7) |
| `src/ui/components/ChordDisplay.tsx` | Create | Shows chord name, Roman numeral, note list |
| `src/ui/components/KeyboardViz.tsx` | Create | 2-octave piano keyboard, highlights chord notes |
| `src/ui/styles.css` | Create | Minimal styling for keyboard, buttons, display |
| `src/ui/index.ts` | Create | Barrel export |
| `tests/music-core/theory.test.ts` | Create | Unit tests for scale/chord resolution (Vitest) |

## Interfaces / Contracts

```typescript
// src/music-core/types.ts
type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';
type Tonality = 'major' | 'minor';
type DegreeNum = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type RomanNumeral = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';
type ChordQuality = 'major' | 'minor' | 'diminished';

interface Key {
  root: NoteName;
  tonality: Tonality;
}

interface ChordResult {
  name: string;           // e.g., "C major"
  degree: RomanNumeral;
  degreeNum: DegreeNum;
  quality: ChordQuality;
  notes: NoteName[];      // spelled for the key, e.g., ['C', 'E', 'G']
}

interface PlaybackEvent {
  notes: NoteName[];
  octave: number;         // default 4 (middle C region)
}
```

```typescript
// src/music-core/theory.ts
function buildScale(key: Key): NoteName[];
function resolveDiatonicTriad(key: Key, degree: DegreeNum): ChordResult;
function noteNames(chord: ChordResult): string;  // "C · E · G"
```

```typescript
// src/audio/playback.ts
function initAudio(): Promise<void>;  // calls Tone.start() on first gesture
function playChord(event: PlaybackEvent): void;
function disposeAudio(): void;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (music-core) | `buildScale()` returns correct 7 notes for all 12 major/minor keys; `resolveDiatonicTriad()` returns correct chord quality/notes for each degree (verify C major: I=Cmaj, II=Dmin, III=Emin, IV=Fmaj, V=Gmaj, VI=Amin, VII=Bdim; A minor: I=Amin, II=Bdim, III=Cmaj, IV=Dmin, V=Emin, VI=Fmaj, VII=Gmaj) | Vitest, pure function assertions |
| Unit (audio) | `playChord()` schedules notes on Tone.js transport; `initAudio()` resumes AudioContext | Mock Tone.js, verify calls |
| Integration | UI: key selection → degree button → display updates + keyboard highlights + audio plays | Playwright or Vitest + React Testing Library; verify DOM updates |
| E2E | Full flow: select C major → click I → hear C-E-G, see highlight, see display | Playwright; smoke test only for prototype |

## Migration / Rollout

No migration required — greenfield prototype. Rollout: single commit scaffold, then incremental layer commits per `work-unit-commits` skill.

## Open Questions

- [ ] Should `tonal.js` be a `dependency` or `devDependency`? (Runtime needed for theory functions)
- [ ] Confirm default octave for playback (spec implies middle C region; product docs mention octave/register as post-MVP)
- [ ] Keyboard visualization: highlight only chord tones, or also show degree labels on keys? (Spec says "exactly the chord's notes")
- [ ] Should degree buttons use uppercase Roman numerals (I-VII) or lowercase for minor/dim (i, ii°, etc.)? Music model uses uppercase in examples.

---

**Design saved to**: `openspec/changes/first-interactive-prototype/design.md` and Engram `sdd/first-interactive-prototype/design`