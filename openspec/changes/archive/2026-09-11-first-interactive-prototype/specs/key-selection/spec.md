# Key Selection Specification

## Purpose

Enable the user to choose a root note and tonality (major or minor), which defines the active musical context for all downstream chord resolution.

## Requirements

### Requirement: Root Note Selection

The system SHALL present the 12 chromatic root notes (C through B, including sharps/flats) as selectable options.

#### Scenario: Select a root note

- GIVEN the app is loaded with no key selected
- WHEN the user selects root "C"
- THEN the active root note is "C"
- AND the tonality selector becomes enabled

### Requirement: Tonality Selection

The system SHALL allow the user to choose between major and minor tonality. The combination of root + tonality defines the active key.

#### Scenario: Select major tonality

- GIVEN root "C" is selected
- WHEN the user selects "major"
- THEN the active key is "C major"
- AND the 7 diatonic triads for C major are available for triggering

#### Scenario: Switch tonality

- GIVEN the active key is "C major"
- WHEN the user switches to "minor"
- THEN the active key becomes "C minor"
- AND chord list updates to reflect C minor diatonic triads

### Requirement: Key Change Updates Chord Context

Changing root or tonality SHALL immediately recompute the available diatonic chords without requiring a separate confirmation step.

#### Scenario: Change root while tonality is set

- GIVEN the active key is "C major"
- WHEN the user selects root "G"
- THEN the active key becomes "G major"
- AND the displayed chords update to G major diatonic triads
