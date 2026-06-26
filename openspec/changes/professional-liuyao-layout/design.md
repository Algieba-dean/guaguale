## Context

The current Liuyao divination logic in the application represents a basic layout displaying only Chinese hexagram names and judgments. It lacks the traditional Najia (纳甲) attributes (Stems, Branches, Palace, Six Relations, Six Beasts, Shi/Ying) which are essential for standard divination. Furthermore, the coin-to-line mapping for Young Yang and Young Yin is inverted in `src/utils/liuyao.ts`. We need a robust layout engine using the existing `lunar-javascript` dependency and a clean, responsive古风 (traditional) UI to render these details.

## Goals / Non-Goals

**Goals:**
- Fix the coin-to-line value mapping for Young Yang and Young Yin in `src/utils/liuyao.ts`.
- Build a Najia layout calculation utility `src/utils/liuyaoLayout.ts` implementing the traditional rules: Xunshi Ge (世应), Rengong Ge (宫位), Najia (地支), and Wu Xing comparisons (六亲, 六神, 旬空, 旺衰).
- Build a responsive古风 visual layout table component in the Liuyao result page displaying these elements clearly.
- Enrich the AI interpretation prompt in `src/utils/deepseek.ts` with these calculated parameters to generate highly professional readings.

**Non-Goals:**
- Rewriting the database/storage schema: we will keep using the existing LocalStorage format and serialize any extra parameters or simply calculate them dynamically on render.
- Modifying other divination methods like Meihua Yishu or Ziwei Dou Shu, except where they share underlying calculations.

## Decisions

### 1. Swapping Young Yang / Young Yin mapping
- **Option A (Chosen)**: Swap the returns for `case 2` (returns 8) and `case 1` (returns 7) in `coinsToLineValue`. This aligns with the traditional rule: "一阳两阴为少阳 (1 Yang = 7), 一阴两阳为少阴 (2 Yang = 8)".
- **Rationale**: This is a direct mathematical mapping fix. It ensures that the generated hexagrams are traditionally correct.

### 2. Layout calculation logic
- **Option A (Chosen)**: Implement pure TS calculation functions in `src/utils/liuyaoLayout.ts` utilizing `Solar` and `Lunar` classes from `lunar-javascript`.
- **Alternative Considered**: Calculating details on-the-fly inside the React UI components.
- **Rationale**: Separating the calculation logic into a utility module keeps the code clean, makes it unit-testable, and allows it to be reused for both history rendering and AI prompt injection.

### 3. UI Presentation
- **Option A (Chosen)**: Render a styled tabular display (incorporating classical borders, light paper background colors, and typography) under the main hexagram.
- **Rationale**: Maintains the high-fidelity traditional aesthetic and matches the visual theme of the website.

## Risks / Trade-offs

- **[Risk] Time zone discrepancies for Ganzhi calculation**
  - *Mitigation*: Use the client's local system time (since this is a frontend-only app) to generate the `lunar-javascript` instance, which matches the standard behavior of local calendar apps.
- **[Risk] Increased prompt length for AI**
  - *Mitigation*: Keep the injected parameter format concise (e.g. `[世爻: 父母辰土]` instead of long paragraphs) to avoid excessive API token usage while providing rich context.
