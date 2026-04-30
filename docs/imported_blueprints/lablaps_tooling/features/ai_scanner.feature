Feature: AI Protocol Scanner
  As a lab worker
  I want to use my device camera to scan paper protocols
  So that I can instantly convert them into executable digital timers without manual data entry

  Background:
    Given the user has an active internet connection
    And the user is authenticated via Supabase

  Scenario: Granting permissions and capturing protocol
    Given the user is on the "Scanner" tab
    When the user taps "Scan Protocol"
    Then the app requests `CAMERA` and `MEDIA` permissions via `expo-image-picker`
    And displays the rationale: "Lab Laps needs access to your photos to scan protocols."

  Scenario: Processing the image into a structured protocol
    Given the user has captured a photo of a protocol
    When the image is uploaded to the backend OCR/AI endpoint
    Then the system returns a parsed JSON payload containing "Steps", "Materials", and "Durations"
    And the app routes to `/app/project/[id].tsx` with the generated protocol loaded