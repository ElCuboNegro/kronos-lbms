Feature: Experiment Management
  As a researcher
  I want to manage experiments, their specimens, and results.

  Scenario: List experiments (Default pagination)
    Given the experiment database
    When the user requests to list experiments with default parameters
    Then the system returns a list of experiments ordered by start date descending (line 44-59)

  Scenario: Create experiment (Success)
    Given a valid experiment payload
    And the director and optional operator exist
    When the user submits the experiment creation
    Then the system creates the experiment
    And links existing specimens, updating their status from "activo" to "en_experimento" if applicable (line 61-83)

  Scenario: Create experiment (Missing Director)
    Given an experiment payload with a non-existent director_id
    When the user submits the experiment creation
    Then the system raises a 404 error "Director no encontrado" (line 64)

  Scenario: Create experiment (Missing Operator)
    Given an experiment payload with a non-existent operador_id
    When the user submits the experiment creation
    Then the system raises a 404 error "Operador no encontrado" (line 66)

  Scenario: Get experiment by ID (Success)
    Given a valid experiment UUID
    And the experiment exists
    When the user requests the experiment by ID
    Then the system returns the experiment details (line 91-93)

  Scenario: Get experiment by code (Success)
    Given a string that is not a valid UUID
    And an experiment exists with a matching code
    When the user requests the experiment by this string
    Then the system returns the experiment details (line 94)

  Scenario: Get experiment (Not Found)
    Given an ID or code that does not match any experiment
    When the user requests the experiment
    Then the system raises a 404 error "Experimento no encontrado" (line 97)

  Scenario: Update experiment (Success)
    Given a valid experiment UUID
    And the experiment exists
    When the user submits a partial update (PATCH)
    Then the system updates only the provided fields (line 102-111)

  Scenario: Update experiment (Not Found)
    Given a non-existent experiment UUID
    When the user submits a PATCH update
    Then the system raises a 404 error "Experimento no encontrado" (line 105)

  Scenario: List experiment results
    Given a valid experiment UUID
    When the user requests the list of results
    Then the system returns all results associated with the experiment ordered by date descending (line 114-120)

  Scenario: Add result to experiment (Success)
    Given a valid experiment UUID
    And a valid result payload
    When the user adds the result
    Then the system links the result to the experiment and the current user (line 122-136)

  Scenario: Add result to experiment (Not Found)
    Given a non-existent experiment UUID
    When the user adds a result
    Then the system raises a 404 error "Experimento no encontrado" (line 124)
