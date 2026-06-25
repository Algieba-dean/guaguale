## 1. Setup and Dependencies

- [x] 1.1 Install `vite-plugin-pwa` dev dependency
- [x] 1.2 Generate PWA icon assets and save them in the public folder
- [x] 1.3 Configure Vite PWA plugin in `vite.config.ts` with manifest details

## 2. Core Implementation

- [x] 2.1 Implement custom `usePWAInstall` hook to intercept installation events and check standalone mode
- [x] 2.2 Add and style the custom installation button in the `Header` component using the hook
- [x] 2.3 Verify build succeeds and service worker registers correctly
