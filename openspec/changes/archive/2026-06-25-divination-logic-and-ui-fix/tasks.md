## 1. Setup & Dependencies

- [x] 1.1 Install `lunar-javascript` dependency in `package.json`
- [x] 1.2 Import and verify the library in the codebase

## 2. Divination Logic Corrections

- [x] 2.1 Fix the hexagram changing line mapping in `HexagramDisplay.tsx` to correct the upside-down highlight bug
- [x] 2.2 Correct the Ziwei Dou Shu twelve palaces assignment in `ZiweiPage.tsx` to align in counter-clockwise order
- [x] 2.3 Refactor the time起卦 calculation in `meihua.ts` to convert solar date to lunar parameters using `lunar-javascript`

## 3. UI/UX Refinement (Impeccable Style)

- [x] 3.1 Refine visual styles in `MeihuaInputPage.tsx` (glassmorphism borders, gold highlights, and typography)
- [x] 3.2 Add converted Lunar Calendar text display to the Meihua input and results panels
- [x] 3.3 Apply refined shadow, outline, and hover effects to the Ziwei astrological chart
- [x] 3.4 Replace native date input with custom Year/Month/Day select dropdowns and add spring cascade animations in ZiweiPage

## 4. Verification & Testing

- [x] 4.1 Execute a clean local production build to check for compilation or TypeScript errors
- [x] 4.2 Use Playwright to capture screenshots and verify the UI fixes and correct highlight alignment
