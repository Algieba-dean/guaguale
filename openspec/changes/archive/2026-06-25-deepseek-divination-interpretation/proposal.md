## Why

Currently, the divination app relies on static, generic interpretations for Liuyao, Meihua, and Ziwei methods. To provide a truly personalized, deep, and comforting experience, the app needs context-aware AI interpretation. Integrating the DeepSeek v4-flash API allows us to dynamically interpret hexagrams and star charts based on the user's specific questions and birth profile.

## What Changes

- Integrate the `openai` SDK to call DeepSeek v4-flash using base URL, model name, and API key loaded from environment variables (`BASE_URL`, `MODEL`, `API_KEY`).
- Update the results pages of Liuyao, Meihua, and Ziwei to trigger real-time AI interpretation immediately after results are generated.
- Add error handling for API network issues with a polished UI/UX retry mechanism, allowing users to manually retry requests if they fail.
- Implement premium loading states and card designs for the AI interpretation results, ensuring a cohesive fit with the "Astral Ink & Gold" aesthetic.

## Capabilities

### New Capabilities

- `ai-interpretation`: Real-time AI-based divination interpretations using the DeepSeek API, with error boundary retries and premium design system styling.

### Modified Capabilities

*None*

## Impact

- **dependencies**: Adds `openai` package to `package.json`.
- **APIs / Environment**: Reads `BASE_URL`, `MODEL`, and `API_KEY` from `.env` or system environment.
- **UI Pages**: Replaces static display zones or adds new dynamic cards in Liuyao, Meihua, and Ziwei results.
