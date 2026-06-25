## 1. HTML Shell & Crawl Assets

- [x] 1.1 Localize HTML tag lang attribute to zh-Hans and insert static base SEO metadata in index.html
- [x] 1.2 Create sitemap.xml and robots.txt in the public folder mapping all five application routes

## 2. Custom React SEO Hook

- [x] 2.1 Implement useSEO custom React hook under src/hooks/useSEO.ts

## 3. Apply Dynamic SEO on Routes

- [x] 3.1 Integrate useSEO hook into HomePage and fix semantic heading hierarchy by changing card titles to h2
- [x] 3.2 Integrate useSEO hook into LiuyaoPage with specialized description and keywords
- [x] 3.3 Integrate useSEO hook into MeihuaPage with specialized description and keywords
- [x] 3.4 Integrate useSEO hook into ZiweiPage with specialized description and keywords
- [x] 3.5 Integrate useSEO hook into HistoryPage with specialized description and keywords

## 4. Verification & Build Check

- [x] 4.1 Perform production build to ensure zero compilation or bundle errors
- [x] 4.2 Validate browser metadata loading and title changes on route navigation using Playwright
