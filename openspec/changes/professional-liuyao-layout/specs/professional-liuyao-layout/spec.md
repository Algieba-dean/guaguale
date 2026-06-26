## ADDED Requirements

### Requirement: Professional Najia Paipan Layout Calculation
The system SHALL compute the professional Najia layout (纳甲排盘) elements for Liuyao divination using the `lunar-javascript` library, including:
1. Heavenly Stems and Earthly Branches (干支) for the year, month, day, and hour of起卦.
2. Xun Kong (旬空) for the day of起卦.
3. Shi (世) and Ying (应) line positions (1-6) using the traditional Xunshi Ge (寻世歌).
4. Palace (本宫) trigram and its associated Wu Xing (五行) element using the Rengong Ge (认宫歌).
5. Earthly Branches (纳爻地支) for each of the 6 lines based on Najia rules.
6. Six Relations (六亲) for each of the 6 lines (兄弟, 子孙, 妻财, 官鬼, 父母) based on the Wu Xing生克 relationships between the palace element and the line branch element.
7. Six Beasts/Spirits (六神) for each of the 6 lines (青龙, 朱雀, 勾陈, 腾蛇, 白虎, 玄武) starting from the day's Heavenly Stem.

#### Scenario: Successful computation of Najia layout parameters
- **WHEN** the user completes a Liuyao divination with 6 lines at a specific time
- **THEN** the system SHALL calculate and assign the correct Ganzhi, Xun Kong, Shi/Ying positions, palace element, and Najia, Liuqin, and Liushen attributes for each line

---

### Requirement: Najia Paipan Visual UI Table Display
The system SHALL display the computed Najia Paipan data in a structured, responsive, traditional rice-paper-styled table directly under the main hexagram on the Liuyao result page.

#### Scenario: Display of Najia table on result page
- **WHEN** the user views the Liuyao result page
- **THEN** the system SHALL render the Najia Paipan table showing line numbers, six spirits, six relations, Earthly Branches, Shi/Ying markers, and Xun Kong indicators

---

### Requirement: Najia Parameters Integration in AI Prompt
The system SHALL inject the computed Najia Paipan parameters (Ganzhi, Xun Kong, palace element, branches, relations, beasts, Shi/Ying positions) into the DeepSeek AI prompt payload to generate more specific, master-level professional readings.

#### Scenario: Enhanced AI prompt generation
- **WHEN** the system requests AI interpretation for a Liuyao divination
- **THEN** the system SHALL include the computed Najia parameters (e.g. "丙午年", "旬空", "世爻", "父母子水") in the prompt sent to the AI API
