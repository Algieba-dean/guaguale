## ADDED Requirements

### Requirement: Authentic Ziwei Star Location Calculation
The system SHALL calculate the Ziwei (Emperor) star location accurately using the traditional division-and-remainder method:
1. Divide the lunar birthday ($D$, 1-30) by the Five Elements Bureau ($B$, 2-6) to find the quotient $Q = \lfloor D / B \rfloor$ and remainder $R = D \pmod B$.
2. If $R = 0$, place the Ziwei star at the palace index `(2 + Q - 1) % 12` (with index 2 as 寅宫).
3. If $R \neq 0$:
   - For Water 2 Bureau: place the Ziwei star at `(1 + Math.floor(D / 2)) % 12` (for $D > 1$, and at 丑宫 (1) for $D = 1$).
   - For other bureaus: determine the base index for the bureau (Wood 3 = 辰 (4), Metal 4 = 亥 (11), Earth 5 = 午 (6), Fire 6 = 酉 (9)). The group is `group = Math.floor((D - 1) / B)`, and the offset is `offset = (D - 1) % B`.
     - Wood 3 Base: `[4, 1, 2]`. Position = `(base[offset] + group) % 12`.
     - Metal 4 Base: `[11, 4, 1, 2]`. Position = `(base[offset] + group) % 12`.
     - Earth 5 Base: `[6, 11, 4, 1, 2]`. Position = `(base[offset] + group) % 12`.
     - Fire 6 Base: `[9, 6, 7, 8, 9, 10]`. Position = `(base[offset] + group) % 12`.

#### Scenario: Accurate Ziwei star placement under Fire 6 Bureau
- **WHEN** the user is born on Lunar Day 13 under Fire 6 Bureau
- **THEN** the system SHALL calculate the Ziwei star position to be 11 (亥宫)

---

### Requirement: Correct Tianfu Star Symmetry Placement
The system SHALL place the Tianfu star symmetrically to the Ziwei star across the 寅-申 axis (indices 2 and 8).
The placement formula MUST be:
$$\text{tianfuIdx} = (4 - \text{ziweiIdx} + 12) \pmod{12}$$

#### Scenario: Symmetrical placement of Tianfu star
- **WHEN** the calculated Ziwei star position is 11 (亥宫)
- **THEN** the system SHALL place the Tianfu star at position 5 (巳宫)

---

### Requirement: Ming Zhu and Shen Zhu Calculations
The system SHALL compute and display the Life Lord (命主) and Body Lord (身主) based on the computed Ming Gong (命宫) earthly branch and the birth year earthly branch respectively:
1. **Life Lord (命主)**:
   - 命宫在子: 贪狼 | 命宫在丑/亥: 巨门 | 命宫在寅/戌: 禄存 | 命宫在卯/酉: 文曲 | 命宫在辰/申: 廉贞 | 命宫在巳/未: 武曲 | 命宫在午: 破军.
2. **Body Lord (身主)**:
   - 子年: 铃星 | 丑/未年: 天相 | 寅/申年: 天梁 | 卯/酉年: 天同 | 辰/戌年: 文昌 | 巳/亥年: 天机 | 午年: 火星.

#### Scenario: Correct Life and Body Lord calculation
- **WHEN** the user is born in a 午 year and their computed Ming Gong is in 申宫
- **THEN** the system SHALL display Life Lord as 廉贞 and Body Lord as 火星

---

### Requirement: Interactive Sanfang Sizheng Highlighting
The system SHALL dynamically highlight the Sanfang Sizheng (Three Harmonies and Opposite) palaces when a user hovers over or clicks any palace cell on the 4x4 grid:
1. **Three Harmonies (三合)**: Palaces located at indices `(currentIdx + 4) % 12` and `(currentIdx + 8) % 12` SHALL be outlined in gold and display a `合` badge.
2. **Opposite (对宫)**: Palace located at `(currentIdx + 6) % 12` SHALL be outlined in terracotta and display a `照` badge.

#### Scenario: Dynamic highlight of Sanfang Sizheng for 巳宫
- **WHEN** the user hovers over the 巳宫 cell
- **THEN** the system SHALL highlight 酉宫 and 丑宫 with a gold border and a `合` badge, and highlight 亥宫 with a terracotta border and a `照` badge

---

### Requirement: Decade and Flowing Year Transit Display
The system SHALL display the decade luck range, transiting flowing ages, and highlight the current calendar year's annual transit on each palace cell:
1. **Decade range**: Calculated according to the Five Elements Bureau starting age and direction.
2. **Flowing ages**: The ages $A$ matching `(birthBranchIdx + A - 1) % 12 === branchIdx` (e.g. $A_0 = (branchIdx - birthBranchIdx + 12) % 12 + 1, A_0 + 12, A_0 + 24...$) SHALL be listed.
3. **Current Flowing Year**: The palace branch matching the current calendar year's branch (e.g. 午 for 2026) SHALL render a high-visibility badge `🎯 当年流年`.

#### Scenario: Transiting ages calculation for a 亥年 born person
- **WHEN** the user was born in a 亥年 and we map the 巳宫 cell
- **THEN** the system SHALL calculate the flowing ages starting at 7 (e.g., 7, 19, 31...)
