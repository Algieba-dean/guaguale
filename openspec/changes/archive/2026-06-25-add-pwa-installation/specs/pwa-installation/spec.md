## ADDED Requirements

### Requirement: Installable Progressive Web App (PWA) Manifest and Service Worker
The system SHALL provide a web app manifest and register a service worker to satisfy browser criteria for PWA installation.

#### Scenario: PWA requirements satisfied
- **WHEN** the user visits the application in a supporting browser
- **THEN** the browser detects a valid manifest (`manifest.json`/`manifest.webmanifest`) and service worker, making the app eligible for installation

### Requirement: Intercept beforeinstallprompt Event
The application SHALL listen for and intercept the browser's native `beforeinstallprompt` event, storing the event object to trigger the prompt later.

#### Scenario: Install prompt event is captured
- **WHEN** the browser fires the `beforeinstallprompt` event
- **THEN** the application intercepts the event, prevents the browser's default bar, and updates state to indicate that installation is available

### Requirement: Custom Installation UI Trigger
The application SHALL render a user-facing install button (e.g. in the header or home screen) only when the installation event has been intercepted, indicating installation is possible.

#### Scenario: Install button visibility based on availability
- **WHEN** the application has captured the `beforeinstallprompt` event and the app is not running in standalone mode
- **THEN** the application displays a user-visible "Install App" button

### Requirement: Launch Native Install Prompt on Click
The application SHALL prompt the user to install the app using the stored browser event when the custom install button is clicked.

#### Scenario: User triggers app installation
- **WHEN** the user clicks the "Install App" button
- **THEN** the application calls `prompt()` on the stored event and awaits the user's choice, logging or responding to the result and clearing the stored event

### Requirement: Hide Install UI in Standalone Mode
The application SHALL detect if it is running in standalone mode (either via `display-mode: standalone` CSS media query or `window.navigator.standalone` API) and hide any custom install prompt UI.

#### Scenario: Application running in standalone mode
- **WHEN** the application is opened as an installed standalone app
- **THEN** the custom install button is hidden from the UI
