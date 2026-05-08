Feature: Laboratory Element Management
  As a researcher
  I want to manage laboratory elements like tools and consumables.

  Scenario: List elements (Default pagination)
    Given the element database
    When the user requests to list elements
    Then the system returns a list ordered by creation date descending (line 26-31)

  Scenario: Create element (Success)
    Given a valid element payload with a unique ID
    When the user creates the element
    Then the system registers the element and returns full details (line 32-39)

  Scenario: Create element (Conflict)
    Given an element payload with an ID that already exists
    When the user creates the element
    Then the system raises a 409 error "ID ya registrado" (line 33)

  Scenario: Get element by technical ID (Success)
    Given a valid technical element ID
    When the user requests the element by ID
    Then the system returns the element details including event history (line 41-51)

  Scenario: Get element by technical ID (Not Found)
    Given a non-existent technical element ID
    When the user requests the element by ID
    Then the system raises a 404 error "Elemento no encontrado" (line 48)

  Scenario: Get element by ID or technical ID (Success)
    Given a valid UUID or technical ID
    When the user requests the element
    Then the system performs a fallback search and returns full details (line 62-71)

  Scenario: Update element (Success)
    Given a valid element UUID
    When the user submits a partial update (PATCH)
    Then the system updates the provided fields and returns the full details (line 73-81)

  Scenario: Update element (Not Found)
    Given a non-existent element UUID
    When the user submits a PATCH update
    Then the system raises a 404 error "Elemento no encontrado" (line 76)
