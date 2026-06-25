# Capability: Traditional Divination Logic

## Purpose
Define requirements and scenarios for traditional Chinese divination logic, specifically correcting and detailing I Ching, Ziwei Dou Shu, and Meihua Yishu calculations.

## Requirements

### Requirement: Hexagram Display Line Mapping and Highlighting
The system SHALL map the 6 lines of a hexagram (from bottom to top) to the visual display, ensuring that changing line indices (1 to 6, where 1 is the bottom-most line) correctly highlight the corresponding lines on the screen.

#### Scenario: Correct highlighted line matching
- **WHEN** a hexagram has a changing line at position 1 (bottom line)
- **THEN** the system SHALL highlight the bottom-most line of the hexagram display on the screen

---

### Requirement: Ziwei Dou Shu Twelve Palaces Counter-Clockwise Grid Layout
The system SHALL arrange the twelve palaces (命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、交友宫、官禄宫、田宅宫、福德宫、父母宫) in a counter-clockwise order around the 4x4 grid perimeter starting from the computed Ming Gong (命宫) position.

#### Scenario: Counter-clockwise palace rotation
- **WHEN** the Ming Gong (命宫) is determined to be at the Zi (子) branch
- **THEN** the system SHALL place the Sibling Palace (兄弟宫) at the Hai (亥) branch and the Spouse Palace (夫妻宫) at the Xu (戌) branch

---

### Requirement: Plum Blossom Divination Lunar Calendar Parameter Calculation
The system SHALL convert solar (Gregorian) date and time parameters into traditional lunar calendar year (Earthly Branch number), month, and day integers, and convert the hour parameter to the corresponding Earthly Branch number (1-12) to calculate the trigrams and changing line position.

#### Scenario: Successful lunar parameter conversion
- **WHEN** the user selects the current time起卦 method
- **THEN** the system SHALL compute the lunar year earthly branch index, lunar month, lunar day, and lunar hour period, and sum them to determine the upper trigram, lower trigram, and changing line position
