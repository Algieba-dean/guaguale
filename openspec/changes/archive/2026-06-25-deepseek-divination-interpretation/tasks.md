## 1. Setup & Config

- [x] 1.1 Install the `openai` SDK dependency in `package.json`
- [x] 1.2 Update `vite.config.ts` to define and inject `process.env.API_KEY`, `process.env.BASE_URL`, and `process.env.MODEL` at compile time

## 2. API Utility

- [x] 2.1 Create `src/utils/deepseek.ts` for DeepSeek client configuration and call wrapper
- [x] 2.2 Define prompt templates and request parameters tailored for Liuyao, Meihua, and Ziwei divination outputs

## 3. UI Component

- [x] 3.1 Implement a reusable `AIInterpretation.tsx` component managing loading, error, success, and retry states
- [x] 3.2 Apply modern Young Guochao styling (dark obsidian background, gold borders, cinnabar retry button, custom loaders) to the component

## 4. Integration

- [x] 4.1 Integrate the AI interpretation block into the Liuyao results page (`ResultPage.tsx`)
- [x] 4.2 Integrate the AI interpretation block into the Meihua results page (`MeihuaResultPage.tsx`)
- [x] 4.3 Integrate the AI interpretation block into the Ziwei astrology results page (`ZiweiPage.tsx`)
