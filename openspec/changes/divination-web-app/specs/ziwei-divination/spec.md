## ADDED Requirements

### Requirement: User can input birth information
The system SHALL collect user's birth date, time, and gender to generate Ziwei Dou Shu chart.

#### Scenario: User enters complete birth information
- **WHEN** user enters birth year, month, day, hour, and gender
- **THEN** system validates the date format and enables chart generation

#### Scenario: User enters invalid date
- **WHEN** user enters an invalid date (e.g., February 30)
- **THEN** system displays validation error and prevents proceeding

#### Scenario: Hour selection
- **WHEN** user selects birth hour
- **THEN** system provides 12 two-hour period options (子时, 丑时, etc.)

### Requirement: System converts to lunar calendar
The system SHALL convert Gregorian calendar birth date to lunar calendar for accurate Ziwei calculation.

#### Scenario: Convert valid Gregorian date
- **WHEN** user provides Gregorian birth date
- **THEN** system converts to corresponding lunar calendar date with year, month, day

#### Scenario: Handle leap months
- **WHEN** birth date falls in a lunar leap month
- **THEN** system correctly identifies and marks the leap month status

### Requirement: System generates natal chart
The system SHALL calculate and position all major stars in the 12 palaces based on birth information.

#### Scenario: Calculate palace positions
- **WHEN** birth information is provided
- **THEN** system determines the 12 palace positions starting from命宫 (Life Palace)

#### Scenario: Place major stars
- **WHEN** palaces are calculated
- **THEN** system correctly places 14 major stars (紫微, 天机, 太阳, etc.) in their respective palaces

#### Scenario: Place auxiliary stars
- **WHEN** major stars are positioned
- **THEN** system places auxiliary stars (左辅, 右弼, 文昌, etc.) based on calculation rules

### Requirement: System displays chart structure
The system SHALL display the natal chart in traditional 12-palace grid format.

#### Scenario: Display palace grid
- **WHEN** chart is generated
- **THEN** system displays 12 palaces in traditional square grid layout

#### Scenario: Show palace names
- **WHEN** displaying chart
- **THEN** system labels each palace (命宫, 兄弟宫, 夫妻宫, etc.)

#### Scenario: Display stars in palaces
- **WHEN** stars are calculated
- **THEN** system shows all stars positioned in their respective palaces with proper symbols

### Requirement: System provides basic interpretation
The system SHALL provide fundamental interpretation of the natal chart focusing on major patterns.

#### Scenario: Interpret life palace
- **WHEN** chart is displayed
- **THEN** system provides interpretation of the Life Palace (命宫) and its major stars

#### Scenario: Identify chart pattern
- **WHEN** all stars are positioned
- **THEN** system identifies major chart patterns (e.g., 紫府同宫, 君臣庆会)

#### Scenario: Provide general guidance
- **WHEN** user views interpretation
- **THEN** system provides general guidance on personality, career tendencies, and relationship patterns
