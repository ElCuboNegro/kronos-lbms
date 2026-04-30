---
colors:
  primary: "#023C69" # Extracted: Deep Navy Blue
  secondary: "#48BB78"
  accent: "#CFB0FB" # Extracted: Lilac/Purple (used in adaptive icon)
  background_light: "#EDEDED" # Extracted: Splash & Status Bar
  background_dark: "#1B1F23" # Extracted: Dark Mode Primary
  surface: "#FFFFFF"
  error: "#FF5722" # Extracted: Material Deep Orange
typography:
  family: "Inter, system-ui, sans-serif"
  sizes:
    base: "16px"
    heading: "24px"
    timer: "48px"
spacing:
  base: "4px"
  container: "16px"
rounded:
  base: "8px"
  button: "6px" # Extracted from btn--primary
---

# Design System: Lab Laps

## Overview
The visual identity is clean and highly functional, leveraging a Material-inspired palette (`#023C69` primary) with high-contrast surfaces to ensure readability under harsh laboratory lighting.

## Color Tokens (Verified)
The app uses strict semantic tokens defined in `colors.xml` and CSS roots:
*   **Primary:** `#023C69`
*   **Splash/Background:** `#EDEDED`
*   **Error:** `#FF5722`

## CSS Component Specifications
From the extracted JS bundle, we identified the exact styling rules for the primary button component:
```css
.btn--primary {
  color: var(--button-primary-color, var(--accent-foreground));
  background: var(--button-primary-background, var(--accent-background));
  border-radius: 6px;
  font-weight: 500;
}
```

## Accessibility Mandates
*   Must support `userInterfaceStyle="light"` and dark modes (found `design_dark_default_color_primary`).
*   Timers utilize large bold fonts to be readable from >3 feet away on a benchtop.