## ADDED Requirements

### Requirement: User can choose divination method
The system SHALL allow users to choose between number-based divination and time-based divination methods.

#### Scenario: Select number-based method
- **WHEN** user selects number-based divination
- **THEN** system displays input fields for three numbers

#### Scenario: Select time-based method
- **WHEN** user selects time-based divination
- **THEN** system uses current timestamp to automatically generate hexagram

### Requirement: User can input numbers for divination
The system SHALL accept three numbers (1-8) from the user to generate hexagram and changing line.

#### Scenario: User inputs valid numbers
- **WHEN** user enters three numbers between 1 and 8
- **THEN** system accepts the input and enables the "Generate Hexagram" button

#### Scenario: User inputs invalid number
- **WHEN** user enters a number outside the 1-8 range
- **THEN** system displays validation error and prevents proceeding

#### Scenario: Number meanings are explained
- **WHEN** user views the number input page
- **THEN** system displays guidance that numbers can be chosen spontaneously or based on observed phenomena

### Requirement: System calculates hexagram from numbers
The system SHALL generate upper trigram, lower trigram, and changing line position from the three input numbers.

#### Scenario: Calculate hexagram from three numbers
- **WHEN** user provides three numbers
- **THEN** system maps first number to upper trigram, second to lower trigram, and third to changing line position

#### Scenario: Map numbers to trigrams
- **WHEN** number is between 1 and 8
- **THEN** system correctly maps to corresponding trigram (1=乾, 2=兑, 3=离, 4=震, 5=巽, 6=坎, 7=艮, 8=坤)

#### Scenario: Calculate changing line
- **WHEN** third number is provided
- **THEN** system calculates changing line position using modulo operation on total sum

### Requirement: System generates hexagram from timestamp
The system SHALL automatically generate hexagram using current date and time when time-based method is selected.

#### Scenario: Use current timestamp
- **WHEN** user selects time-based divination
- **THEN** system captures current year, month, day, hour values

#### Scenario: Calculate trigrams from time
- **WHEN** timestamp is captured
- **THEN** system uses (year + month + day) % 8 for upper trigram and (year + month + day + hour) % 8 for lower trigram

#### Scenario: Calculate changing line from time
- **WHEN** timestamp is used for divination
- **THEN** system calculates changing line position using (year + month + day + hour) % 6

### Requirement: System displays Meihua-specific interpretation
The system SHALL display hexagram interpretation with emphasis on spontaneity and timing aspects of Meihua Yi Shu.

#### Scenario: Display generation method
- **WHEN** hexagram is displayed
- **THEN** system indicates whether it was generated from numbers or timestamp

#### Scenario: Show input values
- **WHEN** displaying results
- **THEN** system shows the original three numbers or timestamp values used

#### Scenario: Emphasize timing context
- **WHEN** time-based method was used
- **THEN** system includes interpretation context about the specific moment of divination
