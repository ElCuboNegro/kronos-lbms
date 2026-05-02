# Future Feature Roadmap (Backlog)

This document tracks formal feature requests and architectural gaps identified for the future growth of the LBMS as the laboratory scales.

## 📍 [FR-001] Spatial & Location Management
**Priority:** High (Once inventory exceeds 1,000 units)
*   **Description:** Implement a hierarchical location model (Building -> Room -> Rack -> Shelf -> Tray).
*   **Goal:** Allow technicians to pinpoint the exact physical location of a `UID`.
*   **Workflow:** Scan a "Shelf QR" to see all associated specimens; move batches between locations via a single scan.

## 📅 [FR-002] Proactive Task & Alert Engine
**Priority:** Medium
*   **Description:** A scheduler that generates tasks based on protocols and expirations.
*   **Goal:** Move from reactive data entry to a proactive "Copilot" mode.
*   **Examples:** Alert when a `LotePreparado` is near expiration; notify to "Check for Roots" 14 days after a cloning event.

## 🔬 [FR-003] Experimental Cohort Analytics
**Priority:** Medium
*   **Description:** Enhanced UI for grouping specimens into "Control" vs "Variable" cohorts within an experiment.
*   **Goal:** Automated statistical comparison (survival rate, average height, variegation stability) between cohorts.

## 📡 [FR-004] IoT & Telemetry Ingestion
**Priority:** Low (Currently handled via manual inheritance)
*   **Description:** API endpoint for receiving real-time data from WiFi/Bluetooth sensors.
*   **Goal:** Automatically populate the `temperatura_c` and `humedad_relativa_pct` in evolution logs based on the current room sensor data, eliminating manual entry.

## 📊 [FR-005] Reporting & Advanced Visualization
**Priority:** Low
*   **Description:** Tooling for data extraction and visualization.
*   **Goal:** Generate growth curves (Line charts of Height vs Time), CSV exports for external analysis, and printable PDF "Experiment Summaries" for scientific documentation.
