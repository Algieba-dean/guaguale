## ADDED Requirements

### Requirement: User can input divination question
The system SHALL allow users to input a specific question before starting the coin-tossing divination process.

#### Scenario: User enters valid question
- **WHEN** user types a question in the input field
- **THEN** system accepts the question and enables the "Start Divination" button

#### Scenario: User proceeds without question
- **WHEN** user clicks "Start Divination" without entering a question
- **THEN** system allows proceeding (question is optional)

### Requirement: User can perform coin-tossing ritual
The system SHALL provide an interactive coin-tossing interface for generating the six lines of a hexagram.

#### Scenario: Complete ritual mode
- **WHEN** user chooses complete ritual mode
- **THEN** system displays coin animation and requires 6 individual clicks to generate each line from bottom to top

#### Scenario: Quick skip mode
- **WHEN** user chooses quick mode
- **THEN** system automatically generates all 6 lines within 1-2 seconds with animation

#### Scenario: Coin animation feedback
- **WHEN** user clicks to toss coins
- **THEN** system displays spinning coin animation and shows the result (老阳/少阳/老阴/少阴)

### Requirement: System calculates hexagram from coin results
The system SHALL calculate the primary hexagram and optional transformed hexagram based on the six coin-toss results.

#### Scenario: Generate primary hexagram without changing lines
- **WHEN** all six tosses result in static lines (少阳/少阴)
- **THEN** system generates only the primary hexagram

#### Scenario: Generate primary and transformed hexagrams
- **WHEN** one or more tosses result in changing lines (老阳/老阴)
- **THEN** system generates both primary hexagram and transformed hexagram

#### Scenario: Hexagram lookup
- **WHEN** six lines are converted to binary representation
- **THEN** system correctly maps to one of the 64 hexagrams

### Requirement: System displays hexagram interpretation
The system SHALL display comprehensive interpretation including hexagram name, structure, judgment text, and contextual guidance.

#### Scenario: Display basic hexagram information
- **WHEN** hexagram is calculated
- **THEN** system displays hexagram name, Unicode symbol, upper/lower trigrams, and structure

#### Scenario: Show bilingual judgment text
- **WHEN** displaying hexagram judgment
- **THEN** system shows both classical Chinese text and modern Chinese translation

#### Scenario: Display changing line interpretations
- **WHEN** hexagram has changing lines
- **THEN** system displays the specific line texts and their translations for each changing line

#### Scenario: Show transformed hexagram
- **WHEN** hexagram has changing lines
- **THEN** system displays both primary and transformed hexagrams with their interpretations

### Requirement: User can review divination history
The system SHALL store divination records locally and allow users to review past divinations.

#### Scenario: Save divination record
- **WHEN** divination is completed
- **THEN** system saves question, timestamp, hexagram results, and changing lines to localStorage

#### Scenario: View history list
- **WHEN** user navigates to history page
- **THEN** system displays all past divination records in reverse chronological order

#### Scenario: View detailed past divination
- **WHEN** user clicks on a history item
- **THEN** system displays the full divination result with all original interpretations

#### Scenario: Mark divination accuracy
- **WHEN** user marks a divination as accurate or inaccurate
- **THEN** system updates the record with the accuracy flag
