# System Architecture & Tech Stack Blueprint

This document distills the technology stack and integration patterns extracted from the compiled Lab Laps application. This serves as the blueprint for **rebuilding these features or integrating them into a new project**.

## Core Stack
*   **Framework:** React Native / Expo (SDK 54.0.0)
*   **Routing:** Expo Router (File-based routing)
*   **JavaScript Engine:** Hermes (with New Architecture enabled)

## Backend & Services
*   **Database & Auth:** **Supabase** (`@supabase/gotrue-js`). Manages user sessions, OAuth, and data syncing via PostgREST RPC.
*   **Telemetry & Analytics:** **PostHog** (`posthog-react-native`).
*   **Error Tracking:** **Sentry** (`@sentry/react-native/expo`).

## Key Expo Native Modules required for feature parity:
To rebuild this app's functionality in a new repository, you must install and configure the following Expo modules:
1.  `expo-image-picker`: Used for the AI Scanner feature.
2.  `expo-audio` & `expo-video`: Used for timer completion alerts and potentially protocol tutorials.
3.  `expo-notifications`: Used for alerting the user when a timer finishes while the app is in the background.
4.  `expo-live-activity`: (iOS only) Used to display running timers on the iOS Lock Screen and Dynamic Island.

## Integration Blueprint (How to replicate)

### 1. The Timer Engine
*   **State:** Use Zustand or Redux to keep timers running in a global context.
*   **Backgrounding:** React Native timers pause when backgrounded. The app calculates the delta (`Date.now() - finishesAt`) upon foregrounding to resume visually.
*   **Live Activities:** Register the timer via `expo-live-activity` so iOS users see the countdown outside the app.

### 2. The AI Scanner
*   **UI:** A button triggers `launchCameraAsync` from `expo-image-picker`.
*   **Backend:** The Base64 image or URI is sent to a Supabase Edge Function (or similar backend API) which wraps an LLM (like OpenAI Vision) to return a structured JSON array of `{ step: string, duration_seconds: number }`.

### 3. Monetization Gateway
*   Wrap critical routes (like the AI Scanner) in a check: `if (!customerInfo.entitlements.active['pro']) { router.push('/paywall') }`.culators (Serial Dilution / Molarity):** Pure functional math logic (e.g., `C1V1 = C2V2`). Keep this business logic decoupled from React components so it can be reused in any frontend.
*   **Cell Culture & Colony Counter:** Utilizes `useReducer` or localized state machines to handle rapid increment/decrement actions without triggering full-screen re-renders.
