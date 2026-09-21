# Archive Report: Visible Voicing Clipping

## Status

Complete. Degree-triggered chord voicings now stay aligned with the visible C3-C6 keyboard range, and related documentation has been synced.

## Implemented

- Degree-triggered chord voicings are clipped to the visible C3-C6 keyboard range.
- Chord identity remains intact when clipping occurs: degree, quality, chord tones, and requested inversion label are preserved.
- High-register inverted degree chords that would clip to an empty voicing now fall back to the clipped root-position voicing for the same degree/register so playback never silently produces an empty audible result when visible chord tones exist.
- Low-edge keyboard-anchored inversions can remain labeled as the requested inversion while only visible notes are played/displayed.
- OpenSpec shortcut documentation now matches the implementation: physical degree shortcuts are `1`-`7` and `Q`-`U`; `A` is reserved for Auto chords.
- README scope language now reflects that inversion/register controls exist.

## Verification

- `npm test` passed with 67 tests.
- `npm run typecheck` passed.
- `npm run build` passed.
- Fresh review after the fallback fix reported no findings.

## Relevant Files

- `src/music-core/theory.ts` — clips degree-triggered voicings and handles empty high-register inversion fallback.
- `tests/music-core/theory.test.ts` — covers visible-range clipping, high-register fallback, and low-edge partial inversion labels.
- `openspec/specs/diatonic-chord-triggering/spec.md` — corrected physical shortcut mapping.
- `README.md` — updated scope language for inversion/register controls.
- `docs/music-model.md` — clarified visible voicing behavior.

## Deferred / Follow-up

- No functional follow-up is required for this specific clipping decision.
- Future voicing work can still add richer accompaniment voicing strategies, but must preserve the visible-keyboard feedback contract.
