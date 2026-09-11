# Chord Display Specification

## Purpose

Show the active chord's name, degree (Roman numeral), and member notes so the user understands what is being played.

## Requirements

### Requirement: Chord Name and Degree Display

The system SHALL display the chord name (e.g. "C major") and its Roman numeral degree (e.g. "I") whenever a chord is triggered.

#### Scenario: Display triggered chord

- GIVEN the active key is "C major" and no chord is active
- WHEN degree I is triggered
- THEN the display shows chord name "C major", degree "I"

#### Scenario: Display updates on new trigger

- GIVEN chord "C major" (I) is displayed
- WHEN degree IV is triggered
- THEN the display updates to "F major" / "IV"

### Requirement: Note List Display

The system SHALL display the individual notes of the active chord (e.g. "C · E · G").

#### Scenario: Show member notes

- GIVEN degree V of C major is triggered
- THEN the display shows notes "G · B · D"

### Requirement: Clear Display on Key Change

When the key changes, the chord display SHALL clear until a new degree is triggered.

#### Scenario: Key change clears display

- GIVEN chord "C major" (I) is displayed
- WHEN the user changes key to "G major"
- THEN the chord display clears (no chord shown)
