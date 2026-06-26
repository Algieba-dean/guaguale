## Why

The current Liuyao (六爻) divination implementation has a logical error where the mapping of coin tosses to Young Yang (少阳) and Young Yin (少阴) is inverted. Furthermore, the existing implementation only provides basic hexagram and line texts, lacking the professional Najia layout (纳甲排盘) elements (Shi/Ying lines, palace element, Earthly Branches, Six Relations, Six Beasts, Xun Kong, etc.) that are critical for traditional divination practitioners and for generating high-quality AI interpretations.

## What Changes

- **Fix Coin-to-Line Mapping**: Swap the mapping of 2 heads (which should be Young Yin / 少阴 / 8) and 1 head (which should be Young Yang / 少阳 / 7) in the coin toss logic to correct the traditional interpretation.
- **Professional Najia Layout Engine**: Implement a professional layout engine in TypeScript using the `lunar-javascript` library to calculate:
  - Year, Month, Day, and Hour Stems and Branches (干支).
  - Xun Kong (旬空) for the day of divination.
  - Shi (世) and Ying (应) line positions using the traditional "Xunshi Ge" (寻世歌).
  - Palace (寻宫) identification using the "Rengong Ge" (认宫歌) to determine the hexagram's element.
  - Earthly Branches for each line (装六支) using Najia mapping.
  - Six Relations (装六亲) based on Wu Xing生克 relationships between the palace and line branches.
  - Six Beasts (装六神) based on the day's Heavenly Stem.
  - Element strengths (旺衰) relative to Month/Day branches.
- **Enhanced UI Layout**: Design and implement a traditional, elegant "rice paper" table layout under the hexagram display on the Liuyao result page, visualizing the detailed Najia Paipan data (branches, relations, beasts, Shi/Ying, Xun Kong, etc.).
- **Upgrade AI Prompt**: Update the DeepSeek prompt payload to include all detailed Najia layout parameters, enabling the AI to generate much more professional, master-level oral interpretations.

## Capabilities

### New Capabilities
- `professional-liuyao-layout`: Implement the complete traditional Najia layout calculation, UI visual board, and enhanced AI integration.

### Modified Capabilities
- `traditional-divination-logic`: Fix the incorrect coin-to-line value mapping for Young Yang and Young Yin.

## Impact

- **Affected Files**:
  - `src/utils/liuyao.ts`: Coin mapping logic.
  - `src/utils/deepseek.ts`: Prompt update.
  - `src/features/liuyao/ResultPage.tsx`: Adding Najia layout display and sending enhanced data to the AI component.
- **Dependencies**: Uses existing `lunar-javascript` library.
- **API**: Changes the prompt schema sent to DeepSeek API (fully backward compatible).
