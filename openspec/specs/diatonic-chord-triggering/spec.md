# Diatonic Chord Triggering Specification

## Purpose

Resolve a scale degree to its corresponding diatonic triad within the active key, and trigger that chord via degree buttons or physical keyboard input.

## Requirements

### Requirement: Degree Button Trigger

The system SHALL present 7 degree buttons (I through VII) that each trigger the corresponding diatonic triad for the active key.

#### Scenario: Trigger degree I in C major

- GIVEN the active key is "C major"
- WHEN the user presses degree button "I"
- THEN chord C major (notes: C, E, G) is triggered
- AND the chord-display updates to show this chord

#### Scenario: Trigger degree IV in A minor

- GIVEN the active key is "A minor"
- WHEN the user presses degree button "IV"
- THEN chord D minor (notes: D, F, A) is triggered

### Requirement: Keyboard Input Trigger

The system SHALL map physical keyboard keys (1-7 or a-g) to diatonic degrees so the user can trigger chords without clicking.

#### Scenario: Press keyboard key for degree

- GIVEN the active key is "C major" and keyboard mapping is active
- WHEN the user presses key "1"
- THEN degree I chord is triggered identically to clicking the I button

#### Scenario: Invalid key mapping

- GIVEN the active key is "C major"
- WHEN the user presses a key not mapped to any degree (e.g. "x")
- THEN no chord is triggered and no error occurs

### Requirement: No Active Key Guard

Triggering a degree when no key is selected SHALL produce no chord and no error.

#### Scenario: Trigger without key

- GIVEN no tonality has been selected
- WHEN the user presses a degree button
- THEN no chord triggers and the UI indicates a key must be selected first
