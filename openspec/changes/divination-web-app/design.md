## Context

This is a greenfield project to create a divination web application that makes traditional Chinese divination methods (六爻, 梅花易数, 紫微斗数) accessible and entertaining. The application must be:
- Purely client-side (deployable to Cloudflare Pages)
- Visually approachable with Q-style traditional aesthetics
- Interactive with smooth animations
- Capable of working offline after initial load

No existing codebase or infrastructure. No backend services. All data processing and storage happens in the browser.

## Goals / Non-Goals

**Goals:**
- Create an engaging, entertainment-focused divination experience
- Implement complete divination algorithms for three systems (prioritized: 六爻 → 梅花 → 紫微)
- Build reusable UI components with traditional aesthetics
- Provide bilingual content (classical Chinese + modern translation)
- Support complete ritual mode and quick skip mode for user flexibility
- Maintain divination history locally with accuracy tracking

**Non-Goals:**
- User authentication or cloud sync
- AI-generated personalized interpretations (pure front-end means no API calls)
- Social sharing features (phase 1)
- Mobile native apps (web-only)
- Real-time collaboration or multiplayer features
- Monetization or paid features (phase 1)

## Decisions

### Tech Stack: React + Vite + Framer Motion + TailwindCSS

**Decision:** Use React as the UI framework with Vite as the build tool, Framer Motion for animations, and TailwindCSS for styling.

**Rationale:**
- React provides component model that maps well to divination flow steps
- Vite offers fast development experience and optimal production builds for static deployment
- Framer Motion enables declarative animations (coin toss, hexagram building, page transitions)
- TailwindCSS allows rapid implementation of custom design system with warm color palette

**Alternatives considered:**
- Vue 3: Excellent choice, but React has slightly better animation library ecosystem
- Svelte: Smaller bundle size, but team familiarity and component library availability favor React
- Plain CSS: More control, but TailwindCSS speeds up implementation of consistent design tokens

### Routing: React Router v6

**Decision:** Use React Router for client-side navigation between divination methods and history.

**Rationale:**
- Multi-page feel with deep linking support
- Clean separation between `/liuyao`, `/meihua`, `/ziwei`, `/history`
- Enables browser back/forward navigation

### Data Architecture: Static JSON + Runtime Calculation

**Decision:** Store hexagram data as static JSON files, perform all divination calculations at runtime in the browser.

**Rationale:**
- 64 hexagrams × ~500 words each = ~100KB compressed (acceptable for static load)
- Calculation algorithms (六爻, 梅花) are deterministic and fast
- No backend means no database - static data is the only option
- JSON structure allows easy iteration during content development

**Structure:**
```javascript
// data/hexagrams.json
{
  "hexagrams": {
    "1": {
      "id": 1,
      "name": "乾",
      "structure": "111111",
      "upper": "乾", "lower": "乾",
      "judgment": {
        "original": "...",
        "translation": "..."
      },
      "lines": [ /* 6 line texts */ ],
      "interpretation": {
        "general": "...",
        "career": "...",
        "relationship": "..."
      }
    }
  }
}

// data/trigrams.json
{
  "1": {"name": "乾", "element": "天", "symbol": "☰"},
  // ... 8 trigrams
}
```

**Alternatives considered:**
- Separate file per hexagram: More granular but increases HTTP requests (worse for Cloudflare Pages)
- Inline in components: Mixes data and logic, harder to maintain

### State Management: React useState + useReducer

**Decision:** Use React's built-in state management, no external library.

**Rationale:**
- Divination state is linear (question → shake → result) - no complex shared state
- Each divination flow is isolated - no cross-feature state sharing
- History is persisted to localStorage, not held in memory
- Adding Redux/Zustand would be over-engineering

**State structure example:**
```javascript
// Liuyao state
const [divinationState, dispatch] = useReducer(reducer, {
  step: 'question',  // question | shake | result
  question: '',
  lines: [],  // [7, 8, 9, 6, 7, 8]
  currentLineIndex: 0,
  mainHexagram: null,
  changingLines: [],
  transformedHexagram: null
});
```

### Local Storage Schema

**Decision:** Store history as JSON array in localStorage key `divination_history`.

**Structure:**
```javascript
{
  "history": [
    {
      "id": "uuid-v4",
      "timestamp": 1719000000000,
      "type": "liuyao" | "meihua" | "ziwei",
      "question": "...",
      "data": {
        // Type-specific fields
        // Liuyao: mainHexagram, changingLines, transformedHexagram
        // Meihua: method, inputValues, hexagram, changingLine
        // Ziwei: birthInfo, chartData
      },
      "userNote": "",
      "accuracy": null | true | false
    }
  ]
}
```

**Rationale:**
- Simple schema, easy to serialize/deserialize
- UUID prevents collisions
- Type-specific data in nested object keeps schema flexible
- Accuracy tracking enables future analytics (even without backend)

**Alternatives considered:**
- IndexedDB: More powerful but overkill for simple history list
- Separate keys per record: Harder to query chronologically

### Deployment: Cloudflare Pages with SPA mode

**Decision:** Deploy as single-page application to Cloudflare Pages with `_redirects` file for client-side routing.

**Configuration:**
```
# public/_redirects
/* /index.html 200
```

**Rationale:**
- Free tier suitable for static sites
- Global CDN with excellent performance
- Direct git integration for CI/CD
- Supports React Router with catch-all redirect

### Animation Strategy: Progressive Enhancement

**Decision:** Use Framer Motion with reduced-motion query support.

**Implementation approach:**
- Primary animations: coin toss, hexagram line building, page transitions
- Respect `prefers-reduced-motion` media query
- Fallback to instant transitions for accessibility

**Example:**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
>
```

### Component Architecture

**Decision:** Feature-based folder structure with shared components.

```
src/
├── components/
│   ├── shared/          # Reusable across features
│   │   ├── CoinAnimation.jsx
│   │   ├── HexagramDisplay.jsx
│   │   └── Button.jsx
│   └── layout/
│       ├── Header.jsx
│       └── Navigation.jsx
├── features/
│   ├── liuyao/
│   │   ├── QuestionPage.jsx
│   │   ├── ShakePage.jsx
│   │   ├── ResultPage.jsx
│   │   └── useLiuyaoDivination.js  # Custom hook for logic
│   ├── meihua/
│   ├── ziwei/
│   └── history/
├── data/
│   ├── hexagrams.json
│   └── trigrams.json
├── utils/
│   ├── hexagram.js      # Calculation logic
│   ├── storage.js       # localStorage abstraction
│   └── calendar.js      # Lunar calendar conversion for 紫微
└── App.jsx
```

**Rationale:**
- Features are isolated and can be developed independently
- Shared components promote consistency
- Utils are pure functions, easy to test
- Clear separation of concerns

## Risks / Trade-offs

### [Risk] Static data limits personalization
**Mitigation:** Focus on entertainment value and clarity of traditional interpretations. Phase 1 does not include AI-generated insights. If future phases need personalization, consider client-side LLM (e.g., Transformers.js) or optional API integration.

### [Risk] Large JSON payload impacts initial load
**Mitigation:** 
- Compress JSON (Vite's build will gzip)
- Lazy load hexagram data only when entering divination flow
- Monitor bundle size, target <150KB for data files
- Consider code-splitting by divination type if needed

### [Risk] Complex 紫微斗数 calculation in JavaScript
**Mitigation:**
- 紫微 is lowest priority (implement after 六爻 and 梅花)
- Use established lunar calendar library (e.g., `lunar-javascript`)
- Validate calculations against known charts
- Provide disclaimer that this is for entertainment purposes

### [Risk] localStorage has 5-10MB limit
**Mitigation:**
- Each history record is ~1-2KB
- Limit history to last 500 records (enforced in storage.js)
- Implement "export to JSON" for users who want to save long-term
- Display storage usage warning at 80% capacity

### [Risk] Browser compatibility for Unicode hexagram symbols
**Mitigation:**
- Fallback to custom SVG hexagram rendering if Unicode not supported
- Detect support: `document.fonts.check('16px monospace', '䷀')`
- Provides better control over visual consistency anyway

### [Risk] Animation performance on low-end devices
**Mitigation:**
- Use CSS transforms (GPU-accelerated) over position changes
- Respect `prefers-reduced-motion`
- Test on mid-range Android devices (performance baseline)
- Provide "skip animation" option if user reports lag

### [Trade-off] No backend means no analytics or A/B testing
**Acceptance:** This is acceptable for phase 1. Focus is on core experience. Can add privacy-respecting client-side analytics (e.g., Plausible) later if needed.

### [Trade-off] Pure front-end limits sharing capabilities
**Acceptance:** Phase 1 does not include social sharing. Future enhancement could generate shareable images (canvas-based) or copy-to-clipboard text summaries.

## Migration Plan

Not applicable - this is a new project with no existing users or data to migrate.

**Deployment steps:**
1. Connect repo to Cloudflare Pages
2. Configure build: `npm run build`, output dir: `dist`
3. Add `_redirects` file to `public/`
4. Deploy to production domain

**Rollback strategy:**
- Cloudflare Pages keeps deployment history - instant rollback via dashboard
- Git tagging for releases enables re-deployment of any version

## Open Questions

1. **Hexagram data completeness:** Do we include 彖辞 and 象辞 in phase 1, or only 卦辞 and 爻辞?
   - **Decision needed by:** Before creating hexagrams.json
   - **Recommendation:** Start with 卦辞 + 爻辞 + general interpretation. Add 彖辞/象辞 in phase 2 if users request it.

2. **Meihua易数 interpretation depth:** How detailed should Meihua interpretations be compared to 六爻?
   - **Decision needed by:** Before writing meihua specs
   - **Recommendation:** Meihua is more intuitive/spontaneous - keep interpretations shorter and more open-ended than 六爻.

3. **紫微斗数 scope for phase 1:** Full natal chart or simplified version?
   - **Decision needed by:** Before implementing ziwei feature
   - **Recommendation:** Start with natal chart display + Life Palace interpretation. Full palace-by-palace analysis in later phase.

4. **Sound effects:** Should coin tossing have sound?
   - **Decision needed by:** During UI implementation
   - **Recommendation:** Add as optional toggle - default off to avoid startling users. Increases bundle size slightly.

5. **Internationalization:** Support English or other languages beyond Chinese?
   - **Decision needed by:** Before content creation
   - **Recommendation:** Phase 1 is Chinese-only (both traditional concepts and target audience). i18n can be added later if demand exists.
