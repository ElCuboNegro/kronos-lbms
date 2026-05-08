Feature: Event Logging
  As a researcher
  I want to log events related to specimens, elements, and experiments to maintain traceability.

  Scenario: Register event (Success)
    Given a valid event payload targeting a specimen, element, or experiment
    And a valid event type
    When the user registers the event
    Then the system creates the event record (line 39-47)
    And returns the event details including the executor name (line 57-73)

  Scenario: Register event (Invalid Type)
    Given an event payload with an invalid type
    When the user registers the event
    Then the system raises a 422 error "Tipo inválido" (line 21)

  Scenario: Register event (Missing Target)
    Given an event payload without especimen_id, elemento_id, or experimento_id
    When the user registers the event
    Then the system raises a 422 error "Debe indicar especimen_id, elemento_id o experimento_id" (line 23)

  Scenario: Register event (Target Not Found)
    Given an event payload with a non-existent especimen_id, elemento_id, or experimento_id
    When the user registers the event
    Then the system raises a 404 error matching the missing target (line 26-34)

  Scenario: Register event (Executor Not Found)
    Given an event payload with a non-existent ejecutado_por_id
    When the user registers the event
    Then the system raises a 404 error "Usuario ejecutor no encontrado" (line 36)

  Scenario: Specimen Contamination Event
    Given an event of type "contaminacion" targeting a specimen
    When the user registers the event
    Then the system creates the event record
    And updates the specimen status to "contaminado" (line 49-52)
