# Keyboard Visualization Specification

## Purpose

Render a keyboard-like UI that highlights the notes of the active chord, giving the user a spatial reference for hand placement.

## Requirements

### Requirement: Keyboard Rendering

The system SHALL render a piano-like keyboard spanning the real visible range C3-C6 with white and black keys.

#### Scenario: Initial render

- GIVEN the app loads
- THEN a keyboard is visible showing piano keys from C3 through C6

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

### Requirement: Generator Note Accent

When a chord or note is triggered, the system SHALL visually distinguish the generator note from the other active chord tones.

#### Scenario: Accent generator note inside chord

- GIVEN the keyboard is visible and no chord is active
- WHEN the user triggers C4 in C major and it resolves to the I chord
- THEN keys C4, E4, and G4 are highlighted as active
- AND C4 has a distinct generator accent

#### Scenario: Pressed state for individual note

- GIVEN the keyboard is visible and no chord is active
- WHEN the user triggers a visual keyboard note that does not resolve to a contextual chord
- THEN only that key is highlighted as active
- AND that same key has the generator accent

### Requirement: Drag-Across Playback

The system SHALL allow pointer drag-across playback on the visual keyboard so a user can keep the pointer pressed and cross keys to trigger each entered key.

#### Scenario: Drag from one key to another

- GIVEN the keyboard is visible and audio can be initialized from user gesture
- WHEN the user presses C4 and drags into D4 without releasing the pointer
- THEN C4 playback stops or is replaced according to the active input state
- AND D4 becomes the active pressed key or contextual chord trigger

#### Scenario: Release drag clears active key

- GIVEN the user is dragging across keyboard keys
- WHEN the pointer is released or cancelled
- THEN playback stops
- AND no key remains pressed because of that pointer interaction

### Requirement: Highlight Clear on Key Change

When the key changes, all highlights SHALL be removed until a new chord is triggered.

#### Scenario: Clear highlights on key change

- GIVEN keys G, B, D are highlighted
- WHEN the user changes the key
- THEN no keys are highlighted
