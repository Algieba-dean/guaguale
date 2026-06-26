## ADDED Requirements

### Requirement: Correct Young Yang and Young Yin Coin-to-Line Mapping
The system SHALL correctly map the count of coin faces (heads/tails) to traditional I Ching line values, ensuring that:
- 3 heads (3 Yang) map to Old Yang (value 9, changing)
- 2 heads (2 Yang, 1 Yin) map to Young Yin (value 8, static)
- 1 head (1 Yang, 2 Yin) map to Young Yang (value 7, static)
- 0 heads (3 Yin) map to Old Yin (value 6, changing)

#### Scenario: Coin tosses mapping to Young Yin
- **WHEN** the coin toss result contains exactly 2 heads and 1 tail
- **THEN** the system SHALL map the result to Young Yin (value 8)

#### Scenario: Coin tosses mapping to Young Yang
- **WHEN** the coin toss result contains exactly 1 head and 2 tails
- **THEN** the system SHALL map the result to Young Yang (value 7)
