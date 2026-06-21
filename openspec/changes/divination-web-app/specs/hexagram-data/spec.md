## ADDED Requirements

### Requirement: System maintains complete 64 hexagram database
The system SHALL store complete information for all 64 hexagrams of the I Ching.

#### Scenario: All hexagrams are available
- **WHEN** system initializes
- **THEN** system has data for all 64 hexagrams numbered 1-64

#### Scenario: Hexagram lookup by structure
- **WHEN** system receives a 6-line binary structure
- **THEN** system returns the correct corresponding hexagram

#### Scenario: Hexagram lookup by ID
- **WHEN** system receives a hexagram number (1-64)
- **THEN** system returns the complete hexagram data

### Requirement: Each hexagram contains basic identification
The system SHALL store name, symbol, structure, and trigram composition for each hexagram.

#### Scenario: Hexagram has Chinese name
- **WHEN** hexagram data is accessed
- **THEN** system provides Chinese name (e.g., 乾, 坤, 节)

#### Scenario: Hexagram has Unicode symbol
- **WHEN** displaying hexagram
- **THEN** system provides Unicode hexagram symbol (䷀-䷿)

#### Scenario: Hexagram structure is defined
- **WHEN** hexagram data is accessed
- **THEN** system provides 6-bit binary structure representing yin/yang lines from bottom to top

#### Scenario: Trigram composition is identified
- **WHEN** displaying hexagram
- **THEN** system provides upper trigram and lower trigram names

### Requirement: Each hexagram contains judgment text
The system SHALL store judgment (卦辞) in both classical Chinese and modern translation.

#### Scenario: Classical judgment text is available
- **WHEN** displaying hexagram interpretation
- **THEN** system provides original classical Chinese judgment text

#### Scenario: Modern translation is available
- **WHEN** displaying hexagram interpretation
- **THEN** system provides modern Chinese translation of judgment text

### Requirement: Each hexagram contains line texts
The system SHALL store all six line texts (爻辞) with translations for each hexagram.

#### Scenario: All six line texts are available
- **WHEN** hexagram data is accessed
- **THEN** system provides texts for all six lines (初爻 through 上爻)

#### Scenario: Line texts have classical and modern versions
- **WHEN** displaying line interpretation
- **THEN** system provides both classical Chinese text and modern translation for each line

#### Scenario: Line position is clearly marked
- **WHEN** displaying line text
- **THEN** system indicates line position (初九/初六, 九二/六二, etc.)

### Requirement: Data structure supports interpretation expansion
The system SHALL organize hexagram data to allow adding detailed interpretations by category.

#### Scenario: General interpretation field exists
- **WHEN** accessing hexagram data
- **THEN** system provides general interpretation field for overall meaning

#### Scenario: Categorized interpretation fields exist
- **WHEN** accessing hexagram data
- **THEN** system provides optional fields for career, relationship, timing, and other interpretation categories

#### Scenario: Data is extensible
- **WHEN** adding new interpretation categories
- **THEN** system data structure allows adding new fields without breaking existing functionality

### Requirement: Trigram reference data is maintained
The system SHALL maintain reference data for all 8 trigrams (八卦).

#### Scenario: All 8 trigrams are defined
- **WHEN** system initializes
- **THEN** system has data for all 8 trigrams (乾, 坤, 坎, 离, 震, 巽, 艮, 兑)

#### Scenario: Trigram has symbol and attributes
- **WHEN** trigram data is accessed
- **THEN** system provides Unicode symbol, element, and nature attributes

#### Scenario: Trigrams map to numbers
- **WHEN** performing Meihua calculations
- **THEN** system correctly maps numbers 1-8 to corresponding trigrams
