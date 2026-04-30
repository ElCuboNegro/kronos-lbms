# UX Analysis: Lab Laps

## Overview
**Lab Laps** is a mobile lab workflow copilot designed in React Native (Expo). It digitizes experimental protocols into structured, timed workflows, integrating hardware utilities (camera, audio) to assist bench scientists.

## Information Architecture (Verified via Expo Router)
1. **Tabs:** Home, Projects, Scanner, Utilities.
2. **Utilities Module:** Includes isolated micro-tools (Cell Culture tracking, Colony Counter, Serial Dilutions).
3. **Execution Module:** Protocols are instantiated into "Projects" (`/project/[id]`), which launch into a `timer-fullscreen` mode.

## Interaction Patterns & UX Flows
*   **Protocol Digitization (AI Scanner):**
    1. User grants `CAMERA` and `MEDIA` permissions.
    2. Takes a photo of a paper protocol.
    3. AI extracts the text and maps it to a JSON structure of steps and timers.
*   **Timer Execution (Focus Mode):**
    1. Timers are started sequentially or in parallel.
    2. Device enters `timer-fullscreen.tsx` to maximize visibility.
    3. Uses `expo-audio` for non-intrusive alert sounds.
*   **Lab Utilities Workflow (The Tooling):**
    1. Standalone tools accessed via the Utilities tab.
    2. High-speed data entry forms for dilution math, cell viability (live/dead counting), and volume calculations.
    3. Results are designed to be copied to the clipboard or appended directly to an active protocol step.

## Design Idioms (CSS Abstractions)
The app uses a strict CSS variable token system. Components map to semantic variables rather than hardcoded hexes:
*   `btn--primary`: Uses `var(--button-primary-background)` and `var(--button-primary-color)`.
*   Hover and Active states are handled via CSS opacity classes.