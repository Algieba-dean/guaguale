## Why

<!-- Explain the motivation for this change. What problem does this solve? Why now? -->
The previous Ziwei Dou Shu implementation had two significant mathematical calculation bugs:
1. The Ziwei (Emperor) star positioning logic calculated incorrect palace indices when the division remainder was odd (e.g. Day 13 under Fire 6 Bureau resulted in index 0 instead of 11).
2. The Tianfu star symmetry calculation used an incorrect axis formula (`10 - ziweiIdx` instead of `4 - ziweiIdx`), which caused the entire Tianfu star group to be misaligned on the board.

Additionally, the UI lacked support for core traditional Ziwei features such as Sanfang Sizheng (Three Harmonies/Opposite) highlights, Sihua (Transformations), Palace Stems (宫干), Decade/Flowing transit ages, and the computation of Ming/Shen Zhu (Life/Body Lords). Correcting these errors and adding these features will make the Ziwei page highly professional, authentic, and interactive.

## What Changes

<!-- Describe what will change. Be specific about new capabilities, modifications, or removals. -->
1. **Correct Ziwei Star Positioning**: Implement the exact, verified group-based day and bureau positioning math.
2. **Correct Tianfu Star Symmetry**: Implement the mathematically sound 寅-申 axis symmetry formula `(4 - ziweiIdx + 12) % 12`.
3. **Display Palace Stems (宫干)**: Map and display both Palace Stem and Earth Branch in the top-right corner of each cell.
4. **Sihua (四化) Badges**: Add birth year Sihua logic and display colored status tags adjacent to major/minor star names.
5. **Decade and Flowing Years (大限流年)**: Display decade luck ranges, specific flowing ages, and highlight the current calendar year's annual transit.
6. **Sanfang Sizheng (三方四正) Interactive Highlighting**: Highlight the Three Harmonies and Opposite palaces dynamically when a user hovers over any cell.
7. **Ming Zhu & Shen Zhu (命主与身主)**: Calculate and display the Life Lord and Body Lord in the central profile panel.
8. **Eight Pillars (四柱八字)**: Display the calculated Year, Month, Day, and Hour Ganzhi columns in the central card.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
None.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `traditional-divination-logic`: Correct the mathematical star positioning and symmetry algorithms, and extend the Ziwei Dou Shu layout to support palace stems, decade/flowing transits, and Ming/Shen Zhu.

## Impact

<!-- Affected code, APIs, dependencies, systems -->
- `src/features/ziwei/ZiweiPage.tsx`: The entire component will be updated with the new formulas, data structure changes, hover highlighting states, and central panel layout.
