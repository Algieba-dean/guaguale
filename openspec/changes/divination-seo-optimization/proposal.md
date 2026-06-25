## Why

The "小卦摊" web application is a Client-Side Rendered (CSR) Single-Page Application that currently lacks standard search engine optimization (SEO) configurations. This includes missing localized HTML lang attribute, default meta descriptions/keywords, OpenGraph/Twitter sharing tags, dynamic page-level titles/descriptions on routing, sitemaps, and strict heading hierarchy. Adding these optimizations will significantly improve discoverability, social sharing cards, and search engine crawler indexing.

## What Changes

- **HTML Localization & Metadata**: Update root `index.html` to set language to `zh-Hans`, add default search meta tags, OpenGraph protocol properties, and Twitter card sharing tags.
- **Dynamic SEO Hook**: Create a custom, lightweight `useSEO` React hook to dynamically update document title, meta descriptions, and keywords on route navigation.
- **Route-specific Metadata**: Integrate the custom `useSEO` hook into all main pages (Home, Liuyao, Meihua, Ziwei, History) with optimized search parameters.
- **Heading Hierarchy**: Correct the heading hierarchy on the Home page (change card titles from `<h3>` to `<h2>` to maintain standard `<h1>` -> `<h2>` hierarchy).
- **Crawl Assets**: Create `robots.txt` and `sitemap.xml` under `/public` to guide crawlers and list all available routes.

## Capabilities

### New Capabilities
- `seo-optimization`: Implements dynamic page title and description updating, PWA social sharing metadata, sitemap crawler discovery, and semantic HTML accessibility standards.

### Modified Capabilities
<!-- No requirement changes to existing capabilities -->

## Impact

- **Affected Files**: `index.html`, `HomePage.tsx`, `LiuyaoPage.tsx`, `MeihuaPage.tsx`, `ZiweiPage.tsx`, `HistoryPage.tsx`.
- **New Files**: `divination-app/src/hooks/useSEO.ts`, `divination-app/public/robots.txt`, `divination-app/public/sitemap.xml`.
