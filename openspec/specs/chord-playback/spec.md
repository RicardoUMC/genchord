# Voicing Playback Specification

## Purpose

Play the active voicing as audible sound with fast response, triggered only by user interaction. A voicing may contain an exact chord voicing or a single keyboard note.

## Requirements

### Requirement: Voicing Sound on Trigger

The system SHALL play all notes of the triggered voicing simultaneously. It SHOULD use the piano sampler when samples are loaded and SHALL fall back to the synth when the sampler is unavailable or not ready.

#### Scenario: Play chord on degree click

- GIVEN the active musical context is "C Ionian (Major)" and AudioContext is initialized
- WHEN the user clicks degree I
- THEN notes C, E, G are heard simultaneously within 50ms of the click

#### Scenario: Play single keyboard note

- GIVEN AudioContext is initialized
- WHEN the user triggers a visual keyboard note that does not resolve to a contextual chord
- THEN that single note is heard within 50ms of the trigger

#### Scenario: Use sampler when loaded

- GIVEN AudioContext is initialized
- AND the piano sampler has loaded successfully
- WHEN the user triggers a voicing
- THEN playback uses the sampler instrument

#### Scenario: Fall back while sampler is unavailable or not ready

- GIVEN AudioContext is initialized
- AND the piano sampler is unavailable or has not finished loading
- WHEN the user triggers a voicing
- THEN playback uses the synth fallback
- AND the visual study flow remains usable

### Requirement: AudioContext Initialization

AudioContext SHALL be created or resumed on the first user gesture to comply with browser autoplay policies.

#### Scenario: First interaction resumes context

- GIVEN the app has loaded and AudioContext is suspended
- WHEN the user clicks any interactive element (key selector or degree button)
- THEN AudioContext resumes and no console error appears

### Requirement: No Playback Without User Gesture

The system SHALL NOT play sound autonomously (e.g. on musical context change or page load).

#### Scenario: Context change does not trigger sound

- GIVEN the app is loaded
- WHEN the user changes musical context from C Ionian to G Ionian
- THEN no sound is played

### Requirement: Fast Response

Playback latency from user gesture to audible output SHALL be under 50ms on standard hardware.

#### Scenario: Low latency playback

- GIVEN AudioContext is active
- WHEN the user triggers a voicing
- THEN sound is audible within 50ms
