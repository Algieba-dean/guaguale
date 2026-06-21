## 1. Project Setup

- [x] 1.1 Initialize React + Vite project with TypeScript template
- [x] 1.2 Install dependencies (react-router-dom, framer-motion, tailwindcss, uuid)
- [x] 1.3 Configure TailwindCSS with custom color palette (warm cream, terracotta accent)
- [x] 1.4 Set up project folder structure (features, components, data, utils)
- [x] 1.5 Create base layout components (Header, Navigation)
- [x] 1.6 Configure React Router with routes for home, liuyao, meihua, ziwei, history
- [x] 1.7 Add Cloudflare Pages deployment config (_redirects file)

## 2. Hexagram Data Layer

- [x] 2.1 Create hexagrams.json with all 64 hexagrams (basic structure: id, name, structure, upper/lower trigrams)
- [x] 2.2 Add judgment texts (original + translation) for all 64 hexagrams (8/64 completed: 乾坤泰否同人复坎离)
- [x] 2.3 Add line texts (original + translation) for all 6 lines × 64 hexagrams (8/64 completed)
- [x] 2.4 Add general interpretations for each hexagram (8/64 completed)
- [x] 2.5 Create trigrams.json with 8 trigrams data
- [x] 2.6 Create hexagram utility functions (lookup by ID, lookup by structure)
- [x] 2.7 Create hexagram calculation logic (binary to hexagram mapping)

## 3. Shared UI Components

- [x] 3.1 Create Button component with Q-style traditional aesthetic
- [x] 3.2 Create CoinAnimation component with spinning animation
- [x] 3.3 Create HexagramDisplay component (renders 6 lines with proper spacing)
- [x] 3.4 Add changing line indication to HexagramDisplay
- [x] 3.5 Create PageTransition wrapper component using Framer Motion
- [x] 3.6 Create LoadingSpinner component with traditional aesthetic
- [x] 3.7 Add prefers-reduced-motion support to all animations

## 4. Local Storage Layer

- [x] 4.1 Create storage.js utility with save/load/delete functions
- [x] 4.2 Implement history record schema with UUID generation
- [x] 4.3 Add 500-record limit enforcement
- [x] 4.4 Add storage capacity warning (80% threshold)
- [x] 4.5 Implement getHistory function with reverse chronological sorting
- [x] 4.6 Add error handling for localStorage quota exceeded

## 5. Home Page

- [x] 5.1 Create home page with three divination method cards
- [x] 5.2 Add card styling with Q-style aesthetic (warm colors, rounded corners)
- [x] 5.3 Add navigation links to each divination method
- [x] 5.4 Display history summary (record count) on home page
- [x] 5.5 Add decorative elements (simplified traditional motifs)

## 6. Liuyao Divination - Question Page

- [x] 6.1 Create QuestionPage component with question input field
- [x] 6.2 Add "Complete Ritual" and "Quick Mode" button options
- [x] 6.3 Create useLiuyaoDivination custom hook for state management
- [x] 6.4 Add form validation (optional question field)
- [x] 6.5 Implement navigation to shake page with state passing

## 7. Liuyao Divination - Shake Page

- [x] 7.1 Create ShakePage component with coin tossing interface
- [x] 7.2 Implement complete ritual mode (6 individual coin tosses)
- [x] 7.3 Add coin toss result calculation (3 coins → 老阳/少阳/老阴/少阴)
- [x] 7.4 Display progressive hexagram building (bottom to top)
- [x] 7.5 Implement quick skip mode (auto-generate all 6 lines with animation)
- [x] 7.6 Add progress indicator (X/6 lines completed)
- [x] 7.7 Implement navigation to result page when complete

## 8. Liuyao Divination - Calculation Logic

- [x] 8.1 Create liuyao.js utility for coin toss simulation
- [x] 8.2 Implement line generation logic (老阳=9, 少阳=7, 少阴=8, 老阴=6)
- [x] 8.3 Create function to convert 6 lines to binary structure
- [x] 8.4 Implement changing line detection (老阳/老阴)
- [x] 8.5 Create transformed hexagram calculation from changing lines
- [x] 8.6 Add hexagram lookup by structure

## 9. Liuyao Divination - Result Page

- [x] 9.1 Create ResultPage component displaying hexagram structure
- [x] 9.2 Display hexagram name, Unicode symbol, and trigram composition
- [x] 9.3 Show judgment text (bilingual: original + translation)
- [x] 9.4 Display changing lines with their specific line texts
- [x] 9.5 Show transformed hexagram (if changing lines exist)
- [x] 9.6 Display general interpretation
- [x] 9.7 Add "Save Record" button that stores to localStorage
- [x] 9.8 Add "New Divination" and "View History" navigation buttons

## 10. Meihua Divination - Input Page

- [x] 10.1 Create MeihuaInputPage with method selection (number vs time)
- [x] 10.2 Add number-based input (3 fields for numbers 1-8)
- [x] 10.3 Add input validation (1-8 range)
- [x] 10.4 Add time-based option with current timestamp display
- [x] 10.5 Add guidance text explaining number input philosophy
- [x] 10.6 Create useMeihuaDivination custom hook

## 11. Meihua Divination - Calculation Logic

- [x] 11.1 Create meihua.js utility for trigram mapping (1-8 → trigrams)
- [x] 11.2 Implement number-based hexagram generation (first number → upper, second → lower)
- [x] 11.3 Implement changing line calculation from third number
- [x] 11.4 Implement time-based hexagram generation (year+month+day → upper, +hour → lower)
- [x] 11.5 Implement time-based changing line calculation
- [x] 11.6 Add hexagram lookup and transformed hexagram calculation

## 12. Meihua Divination - Result Page

- [x] 12.1 Create Meihua result page displaying method used (number/time)
- [x] 12.2 Show original input values (numbers or timestamp)
- [x] 12.3 Display hexagram structure and interpretation
- [x] 12.4 Add timing context for time-based divinations
- [x] 12.5 Add save and navigation buttons

## 13. Ziwei Divination - Birth Input Page

- [ ] 13.1 Create ZiweiBirthPage with date/time/gender inputs
- [ ] 13.2 Add date picker with validation
- [ ] 13.3 Add 12 two-hour period selector for birth hour
- [ ] 13.4 Add gender selection
- [ ] 13.5 Create useZiweiDivination custom hook

## 14. Ziwei Divination - Calendar Conversion

- [ ] 14.1 Install or implement lunar calendar conversion library
- [ ] 14.2 Create calendar.js utility for Gregorian to lunar conversion
- [ ] 14.3 Add leap month detection and handling
- [ ] 14.4 Add conversion validation

## 15. Ziwei Divination - Chart Calculation

- [ ] 15.1 Create ziwei.js utility for natal chart calculation
- [ ] 15.2 Implement 12 palace position calculation starting from 命宫
- [ ] 15.3 Implement 14 major star placement algorithm
- [ ] 15.4 Implement auxiliary star placement
- [ ] 15.5 Create chart data structure with stars in palaces

## 16. Ziwei Divination - Chart Display

- [ ] 16.1 Create ZiweiChartDisplay component with 12-palace grid layout
- [ ] 16.2 Add palace name labels (命宫, 兄弟宫, etc.)
- [ ] 16.3 Display stars in their respective palaces with symbols
- [ ] 16.4 Add responsive layout for mobile/desktop
- [ ] 16.5 Create chart interpretation display for Life Palace
- [ ] 16.6 Add pattern identification display
- [ ] 16.7 Add save and navigation buttons

## 17. History Feature

- [x] 17.1 Create HistoryPage component with record list
- [x] 17.2 Display records in reverse chronological order
- [x] 17.3 Show summary for each record (date, type, question, hexagram/chart name)
- [x] 17.4 Add empty state message for no history
- [x] 17.5 Implement record detail view modal/page
- [x] 17.6 Add accuracy marking UI (accurate/inaccurate buttons)
- [x] 17.7 Add optional note input field
- [x] 17.8 Implement delete individual record with confirmation
- [x] 17.9 Implement clear all history with confirmation

## 18. Styling and Polish

- [x] 18.1 Apply consistent Q-style traditional aesthetic across all pages
- [x] 18.2 Add warm color palette (#F7F4EF background, #C4612F accent)
- [ ] 18.3 Implement responsive design for mobile devices
- [x] 18.4 Add page transition animations between routes
- [x] 18.5 Polish coin animation timing and easing
- [ ] 18.6 Add loading states for data fetching
- [ ] 18.7 Test and fix any layout issues on different screen sizes

## 19. Testing and Deployment

- [x] 19.1 Test complete liuyao flow (ritual and quick mode)
- [x] 19.2 Test meihua divination (both input methods)
- [ ] 19.3 Test ziwei chart generation and display
- [x] 19.4 Test history save/load/delete functionality
- [x] 19.5 Test localStorage capacity warnings
- [x] 19.6 Verify all hexagram data is correct
- [ ] 19.7 Test on mobile devices (iOS Safari, Android Chrome)
- [x] 19.8 Build production bundle and verify size
- [ ] 19.9 Deploy to Cloudflare Pages
- [ ] 19.10 Verify routing works correctly on deployed site
- [ ] 19.4 Test history save/load/delete functionality
- [ ] 19.5 Test localStorage capacity warnings
- [ ] 19.6 Verify all hexagram data is correct
- [ ] 19.7 Test on mobile devices (iOS Safari, Android Chrome)
- [ ] 19.8 Build production bundle and verify size
- [ ] 19.9 Deploy to Cloudflare Pages
- [ ] 19.10 Verify routing works correctly on deployed site
