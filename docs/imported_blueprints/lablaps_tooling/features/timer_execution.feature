Feature: Fullscreen Timer Execution
  As a bench scientist
  I want a dedicated fullscreen view for active timers
  So that my device does not go to sleep while I am wearing gloves and waiting for an incubation to finish

  Scenario: Entering Focus Mode
    Given the user is in a Project at `/app/project/[id].tsx`
    When the user starts a timer
    And the user taps the "Fullscreen" or "Focus Mode" icon
    Then the app routes to `/app/timer-fullscreen.tsx`
    And the device is prevented from sleeping (Wakelock engaged)

  Scenario: Visual and Audio Feedback on Completion
    Given the app is in `timer-fullscreen.tsx`
    When the timer duration reaches 00:00
    Then the screen background flashes the `error` or `accent` color
    And the app plays the `timer-complete-action` sound via `expo-audio`
    And a local push notification is fired (if the app was backgrounded)

  Scenario: Managing Concurrent Timers
    Given multiple timers are running simultaneously
    When the user is in `timer-fullscreen.tsx`
    Then the UI displays a carousel or stacked list of all active timers
    And the timer closest to completion is highlighted at the top of the screen
