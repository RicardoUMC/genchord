# Diatonic Chord Triggering Specification

## Purpose

Resolve a scale degree to its corresponding diatonic triad within the active musical context, and trigger that chord via degree buttons or physical keyboard input.

## Requirements

### Requirement: Degree Button Trigger

The system SHALL present 7 degree buttons that each trigger the corresponding diatonic triad for the active root and mode, using Roman numerals that reflect each mode's chord qualities.

#### Scenario: Trigger degree I in C Ionian

- GIVEN the active musical context is "C Ionian (Major)"
- WHEN the user presses degree button "I"
- THEN chord C major (notes: C, E, G) is triggered
- AND the chord-display updates to show this chord

#### Scenario: Trigger degree iv in A Aeolian

- GIVEN the active musical context is "A Aeolian (Natural Minor)"
- WHEN the user presses degree button "iv"
- THEN chord D minor (notes: D, F, A) is triggered

#### Scenario: Trigger degree iv° in C Lydian

- GIVEN the active musical context is "C Lydian"
- WHEN the user presses degree button "iv°"
- THEN chord F# diminished (notes: F#, A, C) is triggered

### Requirement: Keyboard Input Trigger

The system SHALL map physical keyboard keys (`1`-`7` or `Q`-`U`) to diatonic degrees so the user can trigger chords without clicking. The `A` key SHALL remain reserved for toggling automatic chords.

#### Scenario: Press keyboard key for degree

- GIVEN the active musical context is "C Ionian (Major)" and keyboard mapping is active
- WHEN the user presses key "1"
- THEN degree I chord is triggered identically to clicking the I button

#### Scenario: Invalid key mapping

- GIVEN the active musical context is "C Ionian (Major)"
- WHEN the user presses a key not mapped to any degree (e.g. "x")
- THEN no chord is triggered and no error occurs

### Requirement: No Active Context Guard

Triggering a degree when no musical context is selected SHALL produce no chord and no error.

#### Scenario: Trigger without key

- GIVEN no musical context has been selected
- WHEN the user presses a degree button
- THEN no chord triggers and the UI indicates a key must be selected first
