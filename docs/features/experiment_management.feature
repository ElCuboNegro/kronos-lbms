Feature: Experiment and Research Management
  As a lead scientist
  I want to design, launch, and track formal experiments
  So that I can test hypotheses, apply specific protocols, and track the results of biological interventions

  Background:
    Given I am logged into the LBMS

  Scenario: Create a new formal experiment
    When I create a new experiment named "Low Light Stress Test"
    And I provide a hypothesis, a start date, and assign a Director and Operator
    And I link a specific Protocol (e.g., "Acclimatization")
    Then the experiment should be saved with an "activo" state
    And it should inherit or allow me to define a specific environmental configuration (e.g., low lux)

  Scenario: Assign specimens and elements to an experiment
    Given an active experiment exists
    When I add multiple specimens (e.g., 5 plants) to the experiment
    And I add specific lab equipment (Elementos) used for this test
    Then the specimens and equipment should be linked to the experiment
    And the status of the added specimens should automatically change to "en_experimento"

  Scenario: Record research results and findings
    Given an experiment is currently running
    When I log a new Research Result (Resultado Investigacion) of type "observacion" or "medicion"
    And I provide a descriptive title and detailed notes
    Then the result should be saved and permanently attached to the experiment's timeline
    And my user ID should be recorded as the author of the finding

  Scenario: View experiment timeline and data
    Given an experiment has concluded
    When I navigate to the experiment's detail page
    Then I should see the original hypothesis, the protocol used, and the final state
    And I should see the list of all involved specimens and equipment
    And I should see a chronological list of all registered findings and results
