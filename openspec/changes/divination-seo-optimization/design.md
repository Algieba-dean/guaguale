## Context

The "小卦摊" web application is a Client-Side Rendered (CSR) Single-Page Application (SPA) built with Vite and React. The application needs proper search engine optimization (SEO) configurations. We will introduce static shell improvements, a custom dynamic SEO hook, semantic heading structural changes, and crawling helper documents.

## Goals / Non-Goals

**Goals:**
- Localize HTML `lang` attribute to Chinese (`zh-Hans`).
- Support search metadata (description, keywords) dynamically updated on route change.
- Configure OpenGraph (OG) and Twitter card properties in the base HTML.
- Resolve heading hierarchy skipping levels (skip from `<h1>` directly to `<h3>` on the Home page) to comply with SEO best practices.
- Add `robots.txt` and `sitemap.xml` for crawler indexing.

**Non-Goals:**
- Implementing Server-Side Rendering (SSR) or Static Site Generation (SSG) frameworks (such as Next.js or Astro).
- Dynamic sitemap compilation from runtime databases.

## Decisions

### 1. Custom `useSEO` Hook vs. External Libraries (`react-helmet-async`)
- **Decision**: Implement a custom React hook `useSEO` utilizing direct DOM manipulation (`document.title` and `document.querySelector`) inside `useEffect`.
- **Rationale**: The application is a lightweight, frontend-only SPA. Adding external libraries like `react-helmet-async` would introduce unnecessary bundle overhead, dependency audit concerns, and require wrapping the main app tree in a provider. Direct DOM mutation is lightweight (0 additional bytes) and highly performant. Search engine bots easily parse client-side DOM mutations when crawling JavaScript-enabled sites.
- **Alternatives Considered**:
  - `react-helmet-async`: Rejected due to bundle size and setup complexity.
  - `react-helmet`: Rejected because it is deprecated and has memory leak issues in SSR contexts.

### 2. Static Sitemap and Robots Assets
- **Decision**: Manually maintain `robots.txt` and `sitemap.xml` in the `/public` directory.
- **Rationale**: The application has a finite, static set of routes (`/`, `/liuyao`, `/meihua`, `/ziwei`, `/history`). Because routes do not scale dynamically (e.g., dynamic blog IDs or query parameters), a hardcoded XML sitemap is simple, requires no build-time scripts, and serves crawlers perfectly.
- **Alternatives Considered**:
  - `vite-plugin-sitemap`: Rejected because it adds configuration complexity for a static, simple route list.

### 3. Route Metadata Injection Location
- **Decision**: Call the `useSEO` hook within each page component (e.g. `HomePage`, `ZiweiPage`, etc.) rather than centralizing a lookup map in `App.tsx` or router configs.
- **Rationale**: Keeps metadata co-located with the page files. It makes it easier to read and modify a page's SEO parameters directly inside the corresponding feature directory.

## Risks / Trade-offs

- **[Risk]** Crawlers that do not execute JavaScript (e.g. very basic scraper bots) will only see the default home page metadata in the static `index.html` file.
  - *Mitigation*: Ensure the default `index.html` contains high-quality default metadata summarizing the entire platform's features (周易六爻, 梅花易数, 紫微斗数).
- **[Risk]** Invalid DOM query selector when appending meta elements (duplicates or missing tags).
  - *Mitigation*: The `useSEO` hook will query for existing `meta[name="description"]` and `meta[name="keywords"]` first, only creating new tags if they do not exist.
