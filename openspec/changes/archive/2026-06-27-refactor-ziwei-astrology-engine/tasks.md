## 1. Math Calculations & Core Engine Refactoring

- [x] 1.1 Implement the group-based `getZiweiIdx` lookup math in `src/features/ziwei/ZiweiPage.tsx` to fix odd-remainder positioning errors.
- [x] 1.2 Update `tianfuIdx` calculation to use the correct 寅-申 axis reflection formula: `(4 - ziweiIdx + 12) % 12`.
- [x] 1.3 Implement birth year Sihua (四化) mapping based on `yearGan` and append transformations to major/minor star names.
- [x] 1.4 Calculate and map palace stems (宫干) and earth branches to the returned list.
- [x] 1.5 Calculate the correct list of flowing transit ages (流年岁数) for each cell.
- [x] 1.6 Add calculations for Life Lord (命主) and Body Lord (身主) based on the computed Ming Gong and year branch.

## 2. Interface Rendering & Dynamic Styling

- [x] 2.1 Update palace card container CSS classes to dynamically highlight Sanfang Sizheng (Three Harmonies and Opposite) on hover.
- [x] 2.2 Add small indicator badges (`合` and `照`) next to the palace names when highlighted.
- [x] 2.3 Display Palace Stems alongside Earth Branches in the card header.
- [x] 2.4 Split Sihua suffixes from star names and render them as small colored tags in each cell.
- [x] 2.5 Display decade ranges, flowing ages list, and a special annual transit badge for the current year in the card footer.
- [x] 2.6 Update the central board card to display the birth profile's Eight Pillars (四柱八字) and Life/Body Lords.

## 3. Verification & Integration Tests

- [x] 3.1 Run `npm run build` to confirm there are no TypeScript compile errors.
- [x] 3.2 Execute `./test.sh` to ensure all 42 automated tests pass cleanly.
- [x] 3.3 Verify calculations and UI rendering in the browser using the 2026-06-27 戌时 case.
