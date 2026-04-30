Feature: Protocol Management and Validation
  As a lab scientist
  I want to manage lab protocols and track their validation states
  So that I ensure standardized, approved procedures are followed in the lab

  Background:
    Given I am logged into the LBMS

  Scenario: View available protocols
    When I access the "Protocolos" section
    Then I should see a list of all registered protocols sorted by name

  Scenario: Create a new protocol
    When I initiate the creation of a new protocol
    And I specify a valid type (e.g., "propagacion_in_vitro" or "desinfeccion")
    And I define the steps, required materials, and version
    And I submit the protocol
    Then the protocol should be saved with an initial unvalidated state
    And my user ID should be recorded as the creator

  Scenario: Validate a protocol successfully
    Given a protocol exists in the system with an unvalidated state
    When I submit a validation record for this protocol
    And I mark the result as "exitoso"
    And I provide metrics and observations
    Then the validation record should be saved
    And the protocol's overall validation state should be automatically updated to "validado"

  Scenario: Record a failed protocol validation
    Given a protocol exists in the system
    When I submit a validation record for this protocol
    And I mark the result as "fallido"
    And I provide the failure observations
    Then the validation record should be saved
    But the protocol's overall validation state should not be updated to "validado"

  Scenario: Protocol digitization constraints (API rules)
    When I attempt to create a protocol with an invalid type (e.g., "tipo_desconocido")
    Then the system should reject the request with a 422 validation error
    And it should list the valid options (e.g., extraccion_meristema, propagacion_in_vitro, etc.)
