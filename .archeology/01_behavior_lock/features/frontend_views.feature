Feature: Laboratory Information System Views
  Scenario: Specimen Detail Visualization
    Given a valid specimen UUID
    When navigating to the detail page
    Then the UI fetches and displays genealogy, timeline, and current state.
    Proof: frontend/src/pages/EspecimenDetail.jsx

  Scenario: Real-time Scanning & Search
    Given the Scanner interface
    When a barcode is processed
    Then the UI redirects to the specific entity detail (Reagent, Specimen, or Container).
    Proof: frontend/src/pages/Scanner.jsx and components/ScanInput.jsx
