Feature: Species, Lines, and Variegations Management
  As a researcher
  I want to manage the biological hierarchy of species, their genetic lines, and variegations.

  Scenario: List species with summarized counts
    Given the species database
    When the user requests to list species
    Then the system returns a list with total lines and total individuals calculated via subqueries (line 92-121)

  Scenario: Create species (Success)
    Given a valid species payload with unique name and code
    When the user creates the species
    Then the system registers the species and returns the full details (line 126-137)

  Scenario: Create species (Duplicate Name)
    Given a species payload with a scientific name that already exists
    When the user creates the species
    Then the system raises a 409 error "Especie ya registrada" (line 129)

  Scenario: Create species (Duplicate Code)
    Given a species payload with a code that already exists
    When the user creates the species
    Then the system raises a 409 error "Código de especie ya en uso" (line 132)

  Scenario: Get species by ID or Code (Success)
    Given a valid UUID or species code
    When the user requests the species
    Then the system performs a fallback search and returns full details including lines and variegations (line 58-82)

  Scenario: Create genetic line (Success)
    Given a valid species ID
    And a unique line name for that species
    When the user creates the line
    Then the system registers the line (line 158-168)

  Scenario: Create genetic line (Species Not Found)
    Given a non-existent species ID
    When the user creates a line
    Then the system raises a 404 error "Especie no encontrada" (line 161)

  Scenario: Create genetic line (Duplicate Name)
    Given a line name that already exists in the target species
    When the user creates the line
    Then the system raises a 409 error "Línea ya existe en esta especie" (line 163)

  Scenario: Create variegation (Success)
    Given a valid line ID
    And a unique variegation name for that line
    When the user creates the variegation
    Then the system registers the variegation (line 188-198)

  Scenario: Create variegation (Line Not Found)
    Given a non-existent line ID
    When the user creates a variegation
    Then the system raises a 404 error "Línea no encontrada" (line 191)

  Scenario: Fetch species info from Wikipedia
    Given a valid species ID
    When the user requests Wikipedia info
    Then the system tries to fetch the summary in Spanish, then English as fallback (line 225-231)
    And raises a 404 error if not found in either language (line 232)

  Scenario: List experiments related to species
    Given a valid species ID
    When the user requests related experiments
    Then the system returns experiments that have specimens of this species, counting those specimens (line 247-279)

  Scenario: List protocols related to species
    Given a valid species ID
    When the user requests related protocols
    Then the system returns unique protocols used in experiments or evolution records for this species (line 281-313)

  Scenario: View species photo gallery
    Given a valid species ID
    When the user requests the gallery
    Then the system returns all photos associated with evolution records of specimens of this species (line 315-339)
