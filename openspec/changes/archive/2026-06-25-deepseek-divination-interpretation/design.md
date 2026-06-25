## Context

The divination app is a static React single-page application (SPA) built with Vite. We need to integrate DeepSeek's AI API for hexagram/astrology readings. The user stores configuration keys (`API_KEY`, `BASE_URL`, `MODEL`) in `.env` or system environment variables without the standard `VITE_` prefix.

## Goals / Non-Goals

**Goals:**
- Inject custom environment variables (`API_KEY`, `BASE_URL`, `MODEL`) into the client bundle at build-time using Vite's `define` block.
- Set up a clean API wrapper using the official `openai` SDK.
- Create a unified `AIInterpretation` component with loading indicators, Markdown parsing, and manual retry triggers.
- Integrate the AI interpretation cards into Liuyao, Meihua, and Ziwei results.

**Non-Goals:**
- Creating a separate Node/Express backend proxy (calls will be direct client-to-API).

## Decisions

### 1. Vite Environment Variable Exposure
To read `API_KEY`, `BASE_URL`, and `MODEL` in the browser without renaming them to have the `VITE_` prefix, we will configure `vite.config.ts` to load these values using `loadEnv` and define them globally:
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.API_KEY),
  'process.env.BASE_URL': JSON.stringify(env.BASE_URL),
  'process.env.MODEL': JSON.stringify(env.MODEL),
}
```

### 2. Client-Side API Wrapper (`src/utils/deepseek.ts`)
We will install `openai` and configure the client. Since Vite runs fully in the browser, the client must be initialized with `dangerouslyAllowBrowser: true` to bypass the library's default security check.

### 3. Component Architecture (`AIInterpretation.tsx`)
Create a single reusable React component to manage state:
- **States**: `idle` (before query), `loading` (spinner and thinking messages), `success` (renders Markdown), `error` (network timeout or limit reached).
- **Retry**: On click of the "重新解卦" (Retry) button, the component clears the error state and fires the API query again.

### 4. Custom Prompts for Divination Methods
Separate system prompts will be configured for each method:
- **Liuyao**: Needs analysis of both the Main Hexagram (本卦), the Changing Lines (变爻), and the Transformed Hexagram (之卦) in relation to the question.
- **Meihua**: Needs analysis of Trigrams (体卦 vs 用卦) and earthly branch interactions.
- **Ziwei**: Needs analysis of the Major Stars in the Ming Gong (命宫) and adjacent palaces.

## Risks / Trade-offs

- **[Risk] Exposing keys in client bundle** → *Mitigation*: For development and private hosting, this is acceptable. For production, advise the user to set up API keys with strict usage limits and domain referrer restrictions on the DeepSeek dashboard.
- **[Risk] Network Timeout or Failures** → *Mitigation*: Implemented a clean "Retry" button that allows manual restart of the async request without reloading the entire page or resetting the divination.
