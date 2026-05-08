Feature: Specimen Management
  As a researcher
  I want to register and track individual specimens and perform bulk operations.

  Scenario: List specimens (Default pagination)
    Given the specimen database
    When the user requests to list specimens
    Then the system returns a list ordered by entry date and UID descending (line 26-41)

  Scenario: Create single specimen (Success)
    Given a valid specimen payload with a unique UID
    When the user creates the specimen
    Then the system registers the specimen and returns the full details (line 61-68)

  Scenario: Create single specimen (Conflict)
    Given a specimen payload with a UID that already exists
    When the user creates the specimen
    Then the system raises a 409 error "UID ya registrado" (line 62)

  Scenario: Bulk creation (Success with Inheritance)
    Given a bulk request with multiple items and a species
    And the species has standard configuration (defaults)
    When the user performs the bulk creation
    Then the system uses an advisory lock to safely generate sequential UIDs (line 92-99)
    And inherits technical fields from the species/line hierarchy (line 76-84)
    And creates an initial evolution record with inherited values (line 144-162)
    And registers a "clonacion" event for each new specimen (line 165-171)

  Scenario: Bulk creation (Species Not Found)
    Given a bulk request with a non-existent species_id
    When the user performs the bulk creation
    Then the system raises a 404 error "Especie no encontrada" (line 72)

  Scenario: Get specimen by ID or UID (Success)
    Given a valid UUID or a string UID
    When the user requests the specimen
    Then the system performs a fallback search and returns the full details (line 198-207)

  Scenario: Get specimen (Not Found)
    Given an ID or UID that does not match any specimen
    When the user requests the specimen
    Then the system raises a 404 error "Espécimen no encontrado" (line 205)

  Scenario: Move specimens to container (Success)
    Given a list of specimen IDs and a destination container UID
    When the user requests to move them
    Then the system updates the container UID for all specimens
    And registers a "transferencia" event for each (line 211-233)

  Scenario: Move specimens to container (Not Found)
    Given a list of specimen IDs that do not exist
    When the user requests to move them
    Then the system raises a 404 error "No se encontraron especímenes" (line 217)

  Scenario: Update specimen (Success)
    Given a valid specimen UUID
    When the user submits a partial update (PATCH)
    Then the system updates the provided fields and returns the full details (line 235-243)

  Scenario: Update specimen (Not Found)
    Given a non-existent specimen UUID
    When the user submits a PATCH update
    Then the system raises a 404 error "Espécimen no encontrado" (line 238)
