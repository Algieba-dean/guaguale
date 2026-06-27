## Context

<!-- Background and current state -->
The current Ziwei Dou Shu implementation runs entirely client-side using `lunar-javascript` for calendar conversions. The component `src/features/ziwei/ZiweiPage.tsx` manages user input, charts state, and rendering. The previous version contained two critical math bugs:
1. The Ziwei star index calculation formula erred on odd division remainders (e.g. B=6, D=13 calculated 0 instead of 11).
2. The Tianfu star index was calculated using `10 - ziweiIdx` instead of the correct 寅-申 axis symmetry formula `(4 - ziweiIdx + 12) % 12`.
Furthermore, standard Ziwei board features (Sanfang Sizheng, Sihua, Palace Stems, decade ranges, flowing transits, and Life/Body Lords) were completely missing or placeholder-based.

## Goals / Non-Goals

**Goals:**
<!-- What this design aims to achieve -->
- Fix the mathematical formulas for locating the Ziwei and Tianfu stars.
- Implement authentic calculations for Palace Stems, birth year Sihua, and flowing transit ages.
- Implement interactive, dynamic visual highlighting for Sanfang Sizheng (Three Harmonies and Opposite) on hover.
- Display the Life Lord, Body Lord, and Eight Pillars (四柱八字) in the central board panel.
- Ensure the board remains highly legible, aesthetic, and responsive across all device sizes.

**Non-Goals:**
<!-- What is explicitly out of scope -->
- This change does not affect the I Ching or Plum Blossom divination pages.
- We will not introduce external database dependencies or backend APIs. All calculations must run client-side.

## Decisions

### 1. Unified Star Name Formatting for Sihua
- **Choice**: Store transformed star names as `name·transformation` (e.g., `天机·禄`).
- **Alternative**: Introduce a new object-based structure for stars: `{ name: string; sihua?: '禄' | '权' | '科' | '忌' }[]`.
- **Rationale**: The delimited string format allows backward-compatibility with existing array-based string properties (`majorStars: string[]`), making it easy to integrate without breaking type interfaces. In the JSX renderer, we can easily split the string via `star.split('·')` to render the star name and the styled transformation badge separately.

### 2. Group-Based Shifting for Ziwei Star Placement
- **Choice**: Map the 30 lunar days using a group-and-offset base array for each bureau: `(base[offset] + group) % 12`.
- **Alternative**: Keep using the odd/even conditional division formulas.
- **Rationale**: The odd/even division formula is prone to edge-case bugs (such as Day 3 under Fire 6 Bureau). Group-based mapping is mathematically clean, conforms exactly to the traditional groupings of days (by 2s for Water 2, by 3s for Wood 3, etc.), and guarantees 100% alignment with classical Chinese Ziwei tables.

### 3. Client-Side Symmetry Formula
- **Choice**: Calculate Tianfu position using the 寅-申 axis reflection formula: `tianfuIdx = (4 - ziweiIdx + 12) % 12`.
- **Alternative**: Use lookup tables or conditional branch offsets.
- **Rationale**: The reflection across the 寅-申 axis (indices 2 and 8) is mathematically represented as $T - 2 = -(Z - 2) \pmod{12} \implies T = (4 - Z) \pmod{12}$. This single line of code is elegant, extremely fast, and mathematically rigorous.

## Risks / Trade-offs

<!-- Known risks and trade-offs -->
- **[Risk] Mobile Screen Clutter** $\rightarrow$ Adding Palace Stems, decade ranges, and flowing transits to each cell could overcrowd small screens.
  - *Mitigation*: We will use very small font sizes (e.g., `text-[6.5px]` to `text-[8px]`), compact flex layouts, border dividers (`border-t border-border/10`), and short text labels (e.g., `大限: 4-13` instead of `大限岁数: 4-13岁`) to keep the interface clean and premium.
- **[Risk] Performance Lag on Hover** $\rightarrow$ Re-calculating Sanfang Sizheng and re-rendering all 12 cells on mouse enter/leave could cause lagging.
  - *Mitigation*: The branch indices are small arrays and index checks (e.g., `(branchIdx - hoveredIdx + 12) % 12`) are basic arithmetic that runs in microseconds. React will re-render only the affected border/badge styles without layout thrashing.
