# Musical Context

## Goal

Add a professional-oriented musical context panel that explains the selected mode/scale and shows concrete harmonic information for the selected key.

## Branch

- Branch: `feat/musical-context`
- Worktree: `C:/Users/Marco/genchord-worktrees/musical-context`
- Base at creation: `ab18183` (`fix: clip degree voicings to visible keyboard range`)

## Implemented

- [x] Expanded the shared `Mode` model from 7 diatonic modes to 9 entries:
  - Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
  - Harmonic Minor, Melodic Minor
- [x] Added mode context metadata:
  - display name
  - precise description
  - characteristic note
  - examples
  - typical Roman-numeral progressions
- [x] Added dynamic diatonic chord generation for the selected key/mode.
- [x] Added expandable `MusicalContextPanel` and toggle.
- [x] Reconciled the legacy `src/ui/components/MusicalContext.tsx` with shared metadata.
- [x] Moved all 9 modes into the primary `KeySelector`; no secondary mode selector remains.
- [x] Updated exhaustive UI label maps such as `ChordDisplay`.
- [x] Added focused tests for mode context and panel rendering.

## Verification Evidence

Latest worker verification before commit:

- `npm run build`: passed
- `npm test`: passed — 4 files / 73 tests

Final parent verification should be recorded in the commit output.

## Known Follow-ups

- Musical content should be reviewed by a qualified musician, especially:
  - harmonic/melodic minor triad quality and Roman numerals;
  - song examples and modal claims;
  - Locrian wording, because pure Locrian usage is rare and can confuse students.
- UI review should decide whether this context panel merges with the Studio UX direction or stays as a separate panel.
- `.codegraph/` is local metadata and intentionally untracked.

## Resume Notes

To resume from another machine/session:

```bash
cd C:/Users/Marco/genchord-worktrees/musical-context
npm install
npm run dev
npm test
npm run build
```

Review the UI by switching between all 9 modes and several roots. Confirm the selector, Now Studying display, chord display, and context panel all agree.
