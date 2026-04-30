Feature: Biological Species and Taxonomy Management
  As a lab researcher
  I want to define and manage biological species, genetic lines, and variegations
  So that I can maintain an organized catalog of biological materials and their specific requirements

  Background:
    Given I am logged into the LBMS

  Scenario: Register a new species
    When I submit a new species registration
    And I provide a unique scientific name, common name, and family
    Then the system should save the new species
    And the new species should appear in the species catalog

  Scenario: Prevent duplicate species registration
    Given a species with the scientific name "Monstera deliciosa" already exists
    When I attempt to register another species with the same scientific name
    Then the system should reject the registration with a conflict error (409)
    And it should notify me that the species is already registered

  Scenario: Prevent duplicate species code
    Given a species with the code "MOND" already exists
    When I attempt to register a new species with the code "MOND"
    Then the system should reject the registration with a conflict error (409)
    And it should notify me that the code is already in use

  Scenario: Create a genetic line for a species
    Given a species "Philodendron hederaceum" exists
    When I add a new genetic line named "Line A" to this species
    And I define the propagation method
    Then the line should be saved and associated with the species

  Scenario: Create a variegation for a genetic line
    Given a genetic line "Line A" exists
    When I add a new variegation named "Albo" to this line
    Then the variegation should be saved and associated with the line
    And the variegation should inherit tracking beneath the species and line hierarchy

  Scenario: Fetch external botanical data from Wikipedia
    Given a species with the scientific name "Epipremnum aureum" exists
    When I request the Wikipedia summary for this species
    Then the system should query the Wikipedia API (Spanish or English)
    And it should return a summary containing the title, extract, and a URL link to the full article

  Scenario: View experiments associated with a species
    Given a species exists
    And several specimens of this species are part of active and completed experiments
    When I query the experiments associated with the species
    Then the system should return a list of unique experiments involving this species
    And it should show the count of specimens from this species involved in each experiment

  Scenario: View protocols associated with a species
    Given a species exists
    And specimens of this species have been used in various protocols (via experiments or direct evolution logs)
    When I query the protocols associated with the species
    Then the system should aggregate and return a unique list of protocols
    And the list should include the protocol types, names, and validation states
