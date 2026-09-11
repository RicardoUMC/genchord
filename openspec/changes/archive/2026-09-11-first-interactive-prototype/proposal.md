# Proposal: First Interactive Prototype

## Intent

GenChord is currently docs-only (product, music model, technical direction). This change builds the first working prototype: a web study tool where a user picks a tonality, triggers diatonic chords by degree or keyboard, and sees/hears the result. Purpose: validate the core interaction loop (immediate, understandable, musically correct) before committing to a final stack.

## Scope

### In Scope
- Scaffold TypeScript web app (Vite + React, per `docs/technical-direction.md`).
- Tonality selector: root note + major/minor.
- Diatonic chord resolution for the selected tonality (7 chords per key), in `music-core`.
- Trigger chords via scale degree buttons and keyboard controls.
- Display chord name, degree (Roman numerals), and notes.
- Keyboard-like UI highlighting chord notes.
- Simple chord playback (Tone.js / Web Audio) with fast response.
- Boundary discipline: `music-core` (pure theory, no React/audio), `audio` (playback only), `ui` (state + visuals).

### Out of Scope
- Modes / alternate scales, non-diatonic chords, 7ths/sus/adds.
- Inversions, octave/register controls (product MVP, deferred past prototype).
- Complex voicings, progressions, saved sessions, notation preferences (CDE vs Do Re Mi customizable).
- Piano-realistic audio; advanced Web Audio tuning.

## Capabilities

### New Capabilities
- `key-selection`: choose root + major/minor tonality; drives available chords.
- `diatonic-chord-triggering`: resolve and trigger diatonic chords by scale degree and by keyboard input.
- `chord-display`: show chord name, degree, and member notes for the active context.
- `keyboard-visualization`: render a keyboard-like UI highlighting the chord's notes.
- `chord-playback`: play the resolved chord as a simple sound with fast response.

### Modified Capabilities
- None (no existing specs).

## Approach

- Scaffold Vite + React + TypeScript; add Tone.js for audio and either `tonal.js` (wrapped behind a local boundary) or a small own-core for theory.
- Pure functions in `music-core` compute scale → degrees → chord (quality, notes; spelling per key, e.g. C# vs Db handling deferred beyond triads).
- `audio` receives already-resolved musical events only; no theory rules inside.
- `ui` holds study state (tonality, active degree), renders controls + keyboard, dispatches resolved chords.
- Unit tests for `music-core` (Vitest) once scaffold lands; strict TDD stays off per `openspec/config.yaml`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json`, `vite.config.ts` | New | Scaffold |
| `src/music-core/` | New | Scale/degree/chord resolution, pure |
| `src/audio/` | New | Playback of resolved chords |
| `src/ui/` | New | Tonality selector, degree controls, keyboard viz, chord display |
| `docs/technical-direction.md`, `docs/music-model.md` | Modified | Record what the prototype validated (per AGENTS.md doc rule) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Theory bugs in triad/degree resolution | Med | Pure functions + unit tests; spell triads per key |
| Audio latency/gesture issues | Med | Tone.js default synth, resume AudioContext on first interaction |
| Stack over-fitted to prototype | Med | Keep layers decoupled so Vite→Next or Tone.js→Web Audio swap stays local |

## Rollback Plan

No existing code or specs to break. Rollback = revert the scaffold commit(s) (or delete `src/`, `package.json`) and restore docs; `openspec/specs/` remains untouched since this change ships no archived specs.

## Dependencies

- Vite + React + TypeScript (provisional, per `docs/technical-direction.md`)
- Tone.js (or raw Web Audio)
- tonal.js optional, behind local boundary

## Success Criteria

- [ ] Selecting key + major/minor yields the correct 7 diatonic chords (verify C major: C, Dm, Em, F, G, Am, Bdim; A minor: Am, Bdim, C, Dm, Em, F, G).
- [ ] Degree buttons and keyboard inputs trigger the same chord consistently.
- [ ] Keyboard-like UI highlights exactly the chord's notes.
- [ ] Playback is audible, triggered by user gesture, with no blocked-AudioContext console error.
- [ ] `music-core` imports no React/DOM/audio modules (boundary check).