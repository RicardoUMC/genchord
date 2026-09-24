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

### Requirement: Automatic Chords Control

The system SHALL provide a visible automatic chords toggle and SHALL let the user toggle it with the `A` keyboard shortcut when focus is not inside an editable control. When automatic chords are off, degree controls and keyboard keys SHALL trigger only the selected generator note as a single keyboard tone.

#### Scenario: Toggle automatic chords with visible control

- GIVEN automatic chords are enabled
- WHEN the user activates the automatic chords toggle
- THEN automatic chords are disabled
- AND the toggle communicates the off state

#### Scenario: Toggle automatic chords with A shortcut

- GIVEN automatic chords are enabled and focus is not inside an editable control
- WHEN the user presses `A`
- THEN automatic chords are disabled

#### Scenario: Trigger a degree with automatic chords off

- GIVEN the active musical context is "C Ionian (Major)"
- AND automatic chords are disabled
- WHEN the user presses degree button "I"
- THEN only the C generator note is triggered as a single keyboard tone
- AND the full C major triad is not triggered

### Requirement: Triad Inversion and Degree Chord Octave

The system SHALL let the user choose root position, first inversion, or second inversion for triad voicings, and SHALL let degree-button chords start from octave 3, 4, or 5 while keeping audible/visible notes inside the supported keyboard range when possible.

#### Scenario: Trigger a first inversion triad

- GIVEN the active musical context is "C Ionian (Major)"
- AND triad inversion is set to first inversion
- AND chord octave is set to 4
- WHEN the user presses degree button "I"
- THEN the triggered chord is C major in first inversion
- AND the voicing is E4, G4, C5

#### Scenario: Trigger a degree chord in a selected octave

- GIVEN the active musical context is "C Ionian (Major)"
- AND triad inversion is set to root position
- AND chord octave is set to 3
- WHEN the user presses degree button "V"
- THEN the triggered chord is G major in root position
- AND the voicing starts at G3

#### Scenario: Keep degree chord voicing inside the visible range

- GIVEN the active musical context is "C Ionian (Major)"
- AND chord octave is set to 5
- WHEN the user presses a degree button whose full triad would extend above C6
- THEN the triggered voicing includes only notes inside the C3-C6 visible keyboard range

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
