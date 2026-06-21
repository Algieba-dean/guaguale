## ADDED Requirements

### Requirement: System stores divination records locally
The system SHALL persist divination records in browser localStorage without requiring user accounts.

#### Scenario: Save completed divination
- **WHEN** user completes a divination (any type)
- **THEN** system saves the record to localStorage with unique ID

#### Scenario: Records persist across sessions
- **WHEN** user closes and reopens the application
- **THEN** system retrieves all previously saved divination records

#### Scenario: Storage limit is handled gracefully
- **WHEN** localStorage approaches capacity
- **THEN** system notifies user and prevents data loss

### Requirement: Each record contains complete divination information
The system SHALL store all relevant details to fully reconstruct a divination session.

#### Scenario: Record includes divination type
- **WHEN** saving a record
- **THEN** system stores divination type (liuyao, meihua, or ziwei)

#### Scenario: Record includes user question
- **WHEN** user provided a question
- **THEN** system stores the question text with the record

#### Scenario: Record includes timestamp
- **WHEN** saving a record
- **THEN** system stores the exact date and time of divination

#### Scenario: Liuyao record includes complete hexagram data
- **WHEN** saving a liuyao divination
- **THEN** system stores primary hexagram ID, changing line positions, and transformed hexagram ID (if applicable)

#### Scenario: Meihua record includes input method and values
- **WHEN** saving a meihua divination
- **THEN** system stores whether number-based or time-based method was used and the input values

#### Scenario: Ziwei record includes birth information
- **WHEN** saving a ziwei divination
- **THEN** system stores birth date, time, gender, and calculated chart data

### Requirement: User can view divination history
The system SHALL display a chronological list of all saved divination records.

#### Scenario: Display records in reverse chronological order
- **WHEN** user opens history page
- **THEN** system displays most recent divinations first

#### Scenario: Each record shows summary
- **WHEN** viewing history list
- **THEN** each item displays date, divination type, question (if provided), and hexagram/chart name

#### Scenario: Empty history state
- **WHEN** no divination records exist
- **THEN** system displays message encouraging user to perform first divination

### Requirement: User can review full divination details
The system SHALL allow users to view complete details of any past divination.

#### Scenario: Open record details
- **WHEN** user clicks on a history record
- **THEN** system displays full divination result with all original interpretations

#### Scenario: Details match original session
- **WHEN** viewing past record details
- **THEN** system displays identical hexagram/chart and interpretation as during original session

### Requirement: User can mark divination accuracy
The system SHALL allow users to annotate records with accuracy feedback.

#### Scenario: Mark as accurate
- **WHEN** user marks a divination as accurate
- **THEN** system updates record with positive accuracy flag

#### Scenario: Mark as inaccurate
- **WHEN** user marks a divination as inaccurate
- **THEN** system updates record with negative accuracy flag

#### Scenario: Add optional note
- **WHEN** user adds a text note to a record
- **THEN** system stores the note with the divination record

#### Scenario: Accuracy is optional
- **WHEN** viewing a record
- **THEN** system allows leaving accuracy unmarked

### Requirement: User can manage history records
The system SHALL provide controls for organizing and removing divination records.

#### Scenario: Delete individual record
- **WHEN** user deletes a specific record
- **THEN** system removes it from localStorage and updates the history list

#### Scenario: Clear all history
- **WHEN** user chooses to clear all history
- **THEN** system prompts for confirmation before deleting all records

#### Scenario: Deletion requires confirmation
- **WHEN** user initiates deletion
- **THEN** system displays confirmation dialog to prevent accidental data loss
