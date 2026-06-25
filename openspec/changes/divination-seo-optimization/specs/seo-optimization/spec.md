## ADDED Requirements

### Requirement: Dynamic SEO Metadata Injection Hook
The system SHALL dynamically update document title, description, and keywords during route transitions.

#### Scenario: Dynamic header metadata updates
- **WHEN** the user navigates to `/ziwei`
- **THEN** the system SHALL set `document.title` to `"紫微斗数排盘 - 小卦摊"` and dynamically inject/update `<meta name="description">` and `<meta name="keywords">` with the corresponding configuration.

---

### Requirement: Localized Static Default Meta Shell
The system SHALL define base localization parameters and meta tags in the root index.html to allow basic search crawler indexing.

#### Scenario: Correct HTML lang and base meta loading
- **WHEN** the search engine crawler parses `index.html` statically
- **THEN** the HTML `lang` SHALL be `"zh-Hans"` and default SEO description, keywords, OpenGraph title/description/image, and Twitter card tags SHALL be present in the `<head>`.

---

### Requirement: Search Indexing Crawl Guidance
The system SHALL serve standard crawl instruction files `robots.txt` and `sitemap.xml` under `/public` to guide search engine indexing.

#### Scenario: Crawl assets visibility
- **WHEN** crawlers request `/robots.txt` or `/sitemap.xml`
- **THEN** the server SHALL return a valid text configuration (robots.txt) pointing to the sitemap, and an XML index (sitemap.xml) detailing all active route URLs.

---

### Requirement: Semantic Heading Hierarchy Alignment
The system SHALL maintain a valid, nested heading hierarchy across all core pages to avoid skipping levels (e.g. from `h1` to `h3`).

#### Scenario: Home page semantic cards
- **WHEN** the user visits the Home page
- **THEN** the home page SHALL contain a single `<h1>` title, and the navigation cards (六爻, 梅花, 紫微) SHALL be styled using `<h2>` elements to maintain proper heading hierarchy.
