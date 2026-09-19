# Key Selection Specification

## Purpose

Enable the user to choose a root note and diatonic scale/mode, which defines the active musical context for all downstream chord resolution.

## Requirements

### Requirement: Root Note Selection

The system SHALL present the 12 chromatic root notes (C through B, including sharps/flats) as selectable options.

#### Scenario: Select a root note

- GIVEN the app is loaded with no root selected
- WHEN the user selects root "C"
- THEN the active root note is "C"
- AND the scale/mode selector becomes enabled

### Requirement: Scale / Mode Selection

The system SHALL allow the user to choose one of the 7 diatonic modes: Ionian (Major), Dorian, Phrygian, Lydian, Mixolydian, Aeolian (Natural Minor), and Locrian. The combination of root + mode defines the active musical context.

#### Scenario: Select Ionian mode

- GIVEN root "C" is selected
- WHEN the user selects "Ionian (Major)"
- THEN the active musical context is "C Ionian (Major)"
- AND the 7 diatonic triads for C Ionian are available for triggering

#### Scenario: Switch mode

- GIVEN the active musical context is "C Ionian (Major)"
- WHEN the user switches to "Lydian"
- THEN the active musical context becomes "C Lydian"
- AND the scale uses F# as the fourth degree
- AND chord list updates to reflect C Lydian diatonic triads

### Requirement: Context Change Updates Chord Context

Changing root or mode SHALL immediately recompute the available diatonic chords without requiring a separate confirmation step.

#### Scenario: Change root while mode is set

- GIVEN the active musical context is "C Ionian (Major)"
- WHEN the user selects root "G"
- THEN the active musical context becomes "G Ionian (Major)"
- AND the displayed chords update to G Ionian diatonic triads
