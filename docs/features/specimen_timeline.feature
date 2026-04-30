Feature: Specimen Timeline and Event Tracking
  As a lab researcher
  I want to view a chronological timeline of all events and evolutions for a single specimen
  So that I can trace its complete history, from birth/cloning to its current state, including visual changes

  Background:
    Given I am logged into the LBMS
    And a specimen exists in the system with a history of events

  Scenario: View the chronological event timeline
    When I navigate to the "Ficha" (Detail View) of a specimen
    Then I should see a chronological timeline of all `Eventos` associated with it
    And the timeline should be sorted with the most recent events at the top (`timestamp.desc()`)
    And each event should display the type (e.g., "clonacion", "transferencia"), description, timestamp, and the user who registered it

  Scenario: View evolution logs within the timeline
    Given the specimen has several "Registro de Evolución" entries
    When I view the specimen's timeline or evolution history
    Then I should see the growth metrics (height, leaves) plotted or listed chronologically
    And I should see who logged each specific evolution step

  Scenario: Visual time-lapse via directional photos
    Given the specimen has multiple evolution records spanning several months
    And these records include photos taken from the "frente" (front) angle
    When I browse the visual history of the specimen
    Then the system should allow me to see the progression of the "frente" photos chronologically
    And I should be able to clearly correlate a specific photo with the environmental metrics and notes recorded on that exact date

  Scenario: Cross-referenced experimental events
    Given the specimen was moved into an active experiment last week
    When I view the specimen's timeline
    Then I should see an event indicating its inclusion in the experiment
    And any subsequent evolution logs should indicate if they were recorded under the specific conditions of that experiment

  Scenario: Tracking specimen origin (Birth event)
    When I view the bottom (oldest entry) of a newly cloned specimen's timeline
    Then I should see an initial event of type "clonacion"
    And the description should indicate it was bulk cloned under a specific protocol
    And the event should pinpoint the exact date and time it was separated from its mother plant
