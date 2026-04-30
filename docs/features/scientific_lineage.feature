Feature: Scientific Lineage and Research-Driven Results
  As a lead scientist
  I want to track specimens that are the direct results of research
  So that I can manage multi-generational lineages where the origin of a plant is tied to a specific experimental success

  Background:
    Given I am logged into the LBMS

  Scenario: Designate a specimen as a research objective
    Given an active experiment "Mutation Induction #4"
    When I register a new specimen as a result of this experiment
    And I set its role to "objetivo" within the experiment context
    Then the specimen should be saved as a direct output of "Mutation Induction #4"
    And its "Ficha" should permanently display its origin as a research result

  Scenario: Multi-generational research tracing
    Given Experiment A produced Specimen "Result-A"
    And "Result-A" was later used as the "Mother" plant for Experiment B
    And Experiment B produced Specimen "Result-B"
    When I view the genealogy of "Result-B"
    Then the system should allow me to trace back to "Result-A"
    And from "Result-A", I should be able to jump directly to the data and hypothesis of "Experiment A"
    And I should see the complete "Scientific Ancestry" of the specimen

  Scenario: Track genetic stability across research generations
    Given a lineage of 3 generations of clones produced through sequential research projects
    When I compare the "Registro Evolucion" data (e.g., variegation percentage) across the generations
    Then the system should provide the historical metrics to verify if the "objetivo" traits from the first experiment are stable in the third generation

  Scenario: Audit the "Succession" of lab materials
    When I query the database for all specimens produced by a specific lead scientist's experiments
    Then the system should return a list of "Objective" specimens across all their historical research projects
    And it should show which of those "results" are still active in the current inventory
