# Keyboard Visualization Specification

## Purpose

Render a keyboard-like UI that highlights the notes of the active chord, giving the user a spatial reference for hand placement.

## Requirements

### Requirement: Keyboard Rendering

The system SHALL render a piano-like keyboard spanning at least 2 octaves (e.g. C3-C5) with white and black keys.

#### Scenario: Initial render

- GIVEN the app loads
- THEN a keyboard is visible showing at least 2 octaves of piano keys

### Requirement: Chord Note Highlighting

When a chord is triggered, the system SHALL highlight exactly the keys corresponding to the chord's notes.

#### Scenario: Highlight C major triad

- GIVEN the keyboard is visible and no chord is active
- WHEN degree I of C major is triggered
- THEN keys C, E, and G are highlighted
- AND no other keys are highlighted

#### Scenario: Highlight updates on new chord

- GIVEN keys C, E, G are highlighted
- WHEN degree V of C major is triggered
- THEN highlights move to G, B, D

### Requirement: Highlight Clear on Key Change

When the key changes, all highlights SHALL be removed until a new chord is triggered.

#### Scenario: Clear highlights on key change

- GIVEN keys G, B, D are highlighted
- WHEN the user changes the key
- THEN no keys are highlighted
