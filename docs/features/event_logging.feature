Feature: Universal Event Logging and State Triggers
  As a lab technician
  I want to log arbitrary events on any physical asset
  So that the lab maintains a complete, auditable history of all actions, maintenance, and biological occurrences

  Background:
    Given I am logged into the LBMS

  Scenario: Log a standard lab action
    When I register an event of type "transferencia" (e.g., moving a plant to a new room)
    And I attach it to a specific specimen UID
    And I indicate that I registered it, but another user (ejecutado_por) actually performed the physical work
    Then the event should be saved to the specimen's timeline
    And the system should record both the registering user and the executing user

  Scenario: Automated state changes via events (Contamination)
    Given a specimen is currently in an "activo" state
    When I register an event of type "contaminacion" for this specimen
    And I provide notes about the type of fungus or bacteria observed
    Then the event should be logged to the timeline
    And the system should automatically change the specimen's master state to "contaminado"

  Scenario: Log an event on lab equipment
    Given a piece of lab equipment (Elemento) exists
    When I register an event of type "sanitizacion" or "mantenimiento" linked to the equipment's ID
    Then the event should be appended to the equipment's historical timeline
    And the specific specimen ID or experiment ID fields should remain cleanly null

  Scenario: Prevent invalid event types
    When I attempt to log an event with an unrecognized type like "explosion"
    Then the system should reject the request with a validation error (Status 422)
    And it should return the list of allowed standard event types (e.g., siembra, contaminacion, cosecha)
