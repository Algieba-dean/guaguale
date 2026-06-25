## Context

The `divination-app` is a Vite + React + TypeScript web application built with a classic design system (using colors like cream-light, terracotta, and ink). Users want a native application experience where they can install it from the browser and access it directly from their desktop or home screen, allowing standalone display mode.

## Goals / Non-Goals

**Goals:**
- Implement Progressive Web App (PWA) manifest and register a service worker.
- Intercept the browser's `beforeinstallprompt` event to enable a custom install prompt.
- Design a premium "Install App" button in the `Header` component that perfectly aligns with the app's aesthetic.
- Support both desktop and mobile platform installations.
- Automatically hide the install prompt once the app is installed or running in standalone mode.

**Non-Goals:**
- Push notifications support.
- Fully offline database synchronization (out of scope, though basic offline asset caching will be supported by the default service worker).

## Decisions

### 1. Build integration via `@vitejs/plugin-pwa`
We will use `@vitejs/plugin-pwa` to configure and generate the Service Worker and manifest automatically.
- *Why:* It handles caching of static assets automatically, injects registration code, supports both autoUpdate and promptForUpdate strategies, and eliminates the need for manual boilerplate service worker files.
- *Alternatives considered:* Manual service worker and static manifest files. While simple, they require manually keeping track of asset lists and cache versions, which is highly error-prone in a Vite-based project where assets get fingerprinted during builds.

### 2. Manifest details and assets
A `manifest` block in `vite.config.ts` will specify:
- `name`: "易数占卜"
- `short_name`: "易数占卜"
- `description`: "周易六爻、梅花易数与紫微斗数排盘占卜工具"
- `theme_color`: "#F5EFE6" (matching cream-light)
- `background_color`: "#F5EFE6"
- `display`: "standalone"
- `orientation`: "portrait-primary"
- `icons`: High-resolution icons of size 192x192 and 512x512, plus a maskable icon.
We will generate these icons and place them under `/public/`.

### 3. State management for custom installation prompt
We will implement a custom hook `usePWAInstall` in `src/hooks/usePWAInstall.ts`:
- It listens for `beforeinstallprompt`.
- Saves the event `deferredPrompt` in local state.
- Exposes `isInstallable` (true if `deferredPrompt` exists and app is not standalone).
- Exposes `installApp` (calls `deferredPrompt.prompt()`, waits for decision, and resets state).
- Listens to `appinstalled` to clean up state when installation is completed.
- Detects standalone mode via `window.matchMedia('(display-mode: standalone)').matches` or `navigator.standalone`.

### 4. Custom Install UI in Header
We will insert the install button into the `Header` component.
- The button will only show when `isInstallable` is true.
- Style: An elegant button matching the theme, with a subtle pulse/micro-animation or icon.

## Risks / Trade-offs

- **Risk**: Browser support compatibility (e.g., iOS Safari handles PWA installations differently, not supporting `beforeinstallprompt`).
  - *Mitigation*: The custom install prompt button will only show on platforms that support `beforeinstallprompt` (Chrome, Edge, Samsung Internet, Android Firefox). For unsupported platforms (like iOS Safari), we will degrade gracefully (button is hidden), but standard manual "Add to Home Screen" still works via browser share sheet.
- **Risk**: Cache invalidation or old service worker versions stuck.
  - *Mitigation*: Configure the PWA plugin with `registerType: 'autoUpdate'` to ensure the service worker registers and updates automatically when new versions are deployed.
