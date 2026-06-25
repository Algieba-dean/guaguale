## Why

当前系统在六爻变爻高亮显示、紫微斗数十二宫位排列顺序上存在与传统易学数理完全颠倒的渲染/布局 Bug，并且梅花易数的时间起卦法混淆了公历与农历数字，这严重违背了传统数理的严谨性。为了确保占卜算法的准确无误，同时将 UI/UX 体验打磨到极致，我们现在发起此项逻辑修正与视觉升级。

## What Changes

- **六爻动爻位置纠正**：修正 `HexagramDisplay` 中由卦象数组反转导致的变爻高亮判定倒置 Bug。
- **紫微斗数排盘方向修正**：将十二宫排列从顺时针方向调整为传统的逆时针方向。
- **梅花易数干支与农历换算**：时间起卦法全面对接传统的农历（阴历）年、月、日、时参数计算。
- **UI/UX 精雕细琢**：使用 impeccable 标准对三种占卜方法的输入与输出视图进行精致化优化。

## Capabilities

### New Capabilities
- `traditional-divination-logic`: 规定六爻画卦方向、紫微斗数宫位逆时针排列，以及梅花易数时间起卦采用阴历干支参数的基本推演法则。

### Modified Capabilities
<!-- 无 -->

## Impact

- **Affected Files**:
  - `src/components/shared/HexagramDisplay.tsx` (六爻卦象高亮显示)
  - `src/features/ziwei/ZiweiPage.tsx` (紫微宫位分布与排盘逻辑)
  - `src/utils/meihua.ts` (梅花易数起卦逻辑与计算公式)
  - `src/features/meihua/MeihuaInputPage.tsx` (梅花易数起卦交互界面)
- **New Dependencies**:
  - 引入轻量级且高精度的农历换算算法，无需新增繁重的 npm 依赖。
