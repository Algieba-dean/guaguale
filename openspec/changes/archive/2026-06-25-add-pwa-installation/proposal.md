## Why

Users of the divination-app need a convenient way to access the web application directly from their device desktops or home screens, similar to a native mobile or desktop app. Implementing Progressive Web App (PWA) installation capability allows the application to be installed, launched offline or online, and operate within its own window container.

## What Changes

- Add a web application manifest specifying the app name, icons, start URL, theme colors, and display mode.
- Register a service worker to enable app caching, offline capability, and proper PWA installation criteria.
- Integrate custom install prompt UI within the application header or home page, allowing users to install the application with a single click.
- Configure build tools (Vite) to bundle and inject the manifest and service worker assets automatically.

## Capabilities

### New Capabilities
- `pwa-installation`: Provides standard PWA criteria and UI components to allow the divination-app to be installed on desktop and mobile platforms, displaying a custom "Install App" button when installation is supported.

### Modified Capabilities
<!-- None -->

## Impact

- **Build System**: Vite configuration will incorporate PWA plugins (`vite-plugin-pwa`).
- **Dependencies**: New devDependency on `vite-plugin-pwa` or custom manifest/service worker scripts.
- **Components**: Header or Navigation layout changes to include the installation trigger button.
- **Static Assets**: App icons (sizes 192x192, 512x512, maskable) will be added to the public folder.
