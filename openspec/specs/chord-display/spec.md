# Chord Display Specification

## Purpose

Show the active chord's name, degree (Roman numeral), and member notes so the user understands what is being played in the active musical context.

## Requirements

### Requirement: Chord Name and Degree Display

The system SHALL display the chord name (e.g. "C major") and its Roman numeral degree (e.g. "I") whenever a chord is triggered.

#### Scenario: Display triggered chord

- GIVEN the active musical context is "C Ionian (Major)" and no chord is active
- WHEN degree I is triggered
- THEN the display shows chord name "C major", degree "I"

#### Scenario: Display updates on new trigger

- GIVEN chord "C major" (I) is displayed
- WHEN degree IV is triggered
- THEN the display updates to "F major" / "IV"

### Requirement: Note List Display

The system SHALL display the individual notes of the active chord (e.g. "C · E · G").

#### Scenario: Show member notes

- GIVEN degree V of C Ionian is triggered
- THEN the display shows notes "G · B · D"

### Requirement: Clear Display on Context Change

When the musical context changes, the chord display SHALL clear until a new degree or keyboard tone is triggered.

#### Scenario: Context change clears display

- GIVEN chord "C major" (I) is displayed
- WHEN the user changes musical context to "G Ionian (Major)"
- THEN the chord display clears (no chord shown)
