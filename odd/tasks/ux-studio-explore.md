# UX Studio Explore

## Goal

Prototype a modern, sober, modular study UI inspired by software instruments/VST layout conventions, without making the visual style analog/retro.

## Branch

- Branch: `feat/ux-studio-explore`
- Worktree: `C:/Users/Marco/genchord-worktrees/ux-studio-explore`
- Base at creation: `ab18183` (`fix: clip degree voicings to visible keyboard range`)

## Implemented

- [x] Added a Studio Rack prototype layout around the existing app flow.
- [x] Replaced the visible chord octave dropdown in the prototype with a compact `OctaveBar` immediately below the keyboard.
- [x] Octave bar behavior:
  - 3 thin textless sections for octaves 3/4/5;
  - click selects active octave;
  - global left/right arrow cycling wraps 5 -> 3 and 3 -> 5;
  - editable targets are excluded from global arrow handling;
  - active octave caption appears below the bar.
- [x] Added a tabbed root selector:
  - `Grid`: compact 12-note chromatic grid;
  - `Circle`: circle of fifths with C at the top and common enharmonic labels.
- [x] Added paginated info dialog for the circle of fifths.
- [x] Added mode card grid with family tabs.
- [x] Removed the visible Studio Mode toggle; the sober dark studio palette is now global for the prototype.
- [x] Moved palette toward navy/blue surfaces with yellow reserved for titles/eyebrows and blue reserved for interactive controls.
- [x] Kept rendered keyboard visuals intentionally untouched for later review.
- [x] Updated App and OctaveBar tests for the no-dropdown octave contract.

## Verification Evidence

Latest worker verification before commit:

- `npm test -- tests/ui/App.test.tsx tests/ui/OctaveBar.test.tsx`: passed — 2 files / 35 tests
- `npm run build`: passed
- `npm test`: passed — 4 files / 72 tests

Final parent verification should be recorded in the commit output.

## Known Follow-ups

- Continue visual review in browser:
  - overall density;
  - circle of fifths placement and copy;
  - root selector grid feel;
  - mode card taxonomy;
  - long-term keyboard visual redesign.
- Decide which prototype pieces should graduate into the product UI.
- `src/ui/ThemeToggle.tsx` remains as unused prototype residue and can be deleted in a cleanup pass if still unused.
- `.codegraph/` is local metadata and intentionally untracked.

## Resume Notes

To resume from another machine/session:

```bash
cd C:/Users/Marco/genchord-worktrees/ux-studio-explore
npm install
npm run dev
npm test
npm run build
```

Review the app at the dev-server URL and focus on: octave bar behavior, key selector tabs, circle info dialog, inversion selector width, and palette consistency outside the keyboard.
