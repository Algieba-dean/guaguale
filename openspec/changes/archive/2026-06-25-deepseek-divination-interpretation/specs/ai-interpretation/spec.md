## ADDED Requirements

### Requirement: Divination AI Interpretation Request
The system SHALL request an AI-generated interpretation from the DeepSeek API once a divination result is generated for Liuyao, Meihua, or Ziwei.

#### Scenario: Successful interpretation generation
- **WHEN** a divination result is completed and valid environment variables (`API_KEY`, `BASE_URL`, `MODEL`) are configured
- **THEN** the system SHALL send the question (if any), hexagram/star details, and guidelines to the DeepSeek API, display a premium loading spinner, and render the resulting interpretation in a styled glassmorphic panel.

### Requirement: Resilient API Call Error Handling and Manual Retry
The system SHALL handle network timeouts, rate limit issues, and general API failures gracefully, providing a manual retry control for the user.

#### Scenario: API request failure and retry execution
- **WHEN** the DeepSeek API request encounters a network error, HTTP error, or timeout
- **THEN** the system SHALL display a premium error card notifying the user and render a "重新解卦" (Retry Interpretation) button that triggers a reload of the API request when clicked.
