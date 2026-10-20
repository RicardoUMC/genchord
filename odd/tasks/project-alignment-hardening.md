# Project Alignment Hardening

## Goal

Bring project metadata, specs, and maintenance configuration in line with the current GenChord prototype before starting larger product work.

## Tasks

- [x] Update OpenSpec config to reflect the real app/test/tooling state.
  - Evidence: `openspec/config.yaml` now records app/package presence, Vitest, `npm test`, `npm run typecheck`, and no lint command; recovered writer self-check passed.
- [x] Synchronize active OpenSpec specs with already implemented features: auto-chords, triad inversion, chord octave/register, scale guide, and polyphonic held inputs.
  - Evidence: updated `chord-playback`, `diatonic-chord-triggering`, and `keyboard-visualization` specs; recovered writer self-check passed.
- [x] Resolve the next product increment with the user before implementation.
  - Evidence: user selected Musical Context validation; priority and boundaries recorded in `docs/product.md`.
- [x] Harden maintenance configuration by pinning dev dependency versions and considering lint/format/check workflow.
  - Evidence: five `latest` entries pinned to lockfile versions; `npm run check` added; lint absence and manual browser-audio checklist documented; writer ran `npm run check` successfully (68 tests plus typecheck).
- [x] Verify with available checks.
  - Evidence: writer and independent verifier passed `npm run check` (typecheck plus 68 tests), `npm run build`, JSON parsing, and `git diff --check`; no candidate defect found.

## Commit Evidence

- `7186c8f` — `chore: align project specs and tooling`

## Notes

- Conversation language: Spanish.
- Repository-facing artifacts remain in English unless extending existing Spanish docs.
- Commits are intentionally not made unless the user explicitly requests them.
