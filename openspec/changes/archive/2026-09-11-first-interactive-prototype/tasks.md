# Tasks: First Interactive Prototype

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650-900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 scaffold/core → PR 2 UI/audio → PR 3 tests/docs polish |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Resolved by user for PR 2 slice
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Scaffold app + pure `music-core` | PR 1 | Enables tests and keeps theory isolated. |
| 2 | Wire study UI + Tone.js audio | PR 2 | Depends on PR 1; validates interaction loop. |
| 3 | Add verification tests + docs | PR 3 | Depends on PR 2; closes spec evidence. |

## Phase 1: Scaffold / Foundation

- [x] 1.1 Create `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json` with Vite + React 18 + strict TS.
- [x] 1.2 Add Vitest/React testing dev deps after scaffold exists. Deferred `@tonaljs/tonal` and `tone` because PR 1 uses a minimal internal music-core and intentionally excludes audio.
- [x] 1.3 Create `src/main.tsx`, `src/App.tsx`, and `src/ui/styles.css` minimal app shell.

## Phase 2: Music Core

- [x] 2.1 Create `src/music-core/types.ts` for note, key, degree, quality, chord result, and playback event; default octave = 4.
- [x] 2.2 Create `src/music-core/theory.ts` with minimal internal `buildScale()`, `resolveDiatonicTriad()`, `noteNames()` implementation.
- [x] 2.3 Encode Roman numerals by chord quality: major uppercase, minor lowercase, diminished lowercase with `°`.
- [x] 2.4 Create `src/music-core/index.ts`; verify it imports no React, DOM, or audio modules.

## Phase 3: UI / Audio Integration

- [x] 3.1 Create `src/ui/state.ts` reducer for active key, active degree/chord, no-key guard, and clear-on-key-change behavior.
- [x] 3.2 Create `KeySelector.tsx`, `DegreeButtons.tsx`, `ChordDisplay.tsx`, `KeyboardViz.tsx` under `src/ui/components/`.
- [x] 3.3 Map click and physical keys `1-7`/`KeyQ-KeyU` to identical degree triggers; ignore unmapped keys.
- [x] 3.4 Highlight chord tones only in `KeyboardViz` across at least C3-C5; clear highlights on key change.
- [x] 3.5 Create `src/audio/playback.ts` and `src/audio/index.ts` using Tone.js PolySynth, `Tone.start()` on first gesture, no autoplay.
- [x] 3.6 Wire `src/App.tsx` so resolved chords update display/keyboard and send pre-resolved playback events to audio.

## Phase 4: Testing / Verification

- [x] 4.1 Add `tests/music-core/theory.test.ts` for all 12 major/minor scales plus C major and A minor triads. PR 3 expanded coverage to all 12 prototype major and natural minor roots, including diminished vii°/ii° edge cases.
- [x] 4.2 Add component/integration tests for key selection, degree click, keyboard trigger equivalence, no-key guard, and clear-on-key-change. PR 2 added App integration coverage for these flows; PR 3 verified the suite remains passing.
- [x] 4.3 Add audio tests with Tone.js mocked: first gesture initializes context; key changes do not play. PR 3 added focused `playback.ts` adapter tests; key-change no-play remains covered through the mocked app audio boundary.
- [x] 4.4 Run lint/typecheck/test scripts and record commands in verification notes. No lint script exists; PR 3 ran typecheck, test, and build.

## Phase 5: Documentation

- [x] 5.1 Update `docs/technical-direction.md` with resolved prototype defaults: Vite/React/TS, no `tonal.js` runtime dependency yet, Tone.js.
- [x] 5.2 Update `docs/music-model.md` with prototype Roman numeral casing and chord-tone-only highlighting defaults.
