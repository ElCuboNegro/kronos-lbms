Feature: Variegation and Genetic Trait Management
  As a lab researcher
  I want to manage specific variegations and morphological traits within a genetic line
  So that I can track unique phenotypes and their specific environmental or nutritional requirements

  Background:
    Given I am logged into the LBMS
    And a genetic line "Monstera Albo-Borsigiana" exists in the system

  Scenario: Register a new variegation
    When I add a new variegation named "Half-Moon" to the genetic line
    And I provide an optional code and description
    And I define specific standard environmental configurations (config_estandar)
    Then the variegation should be saved
    And it should be linked to the parent genetic line

  Scenario: Prevent duplicate variegation names within the same line
    Given a variegation named "Marbled" already exists in the genetic line
    When I attempt to add another variegation named "Marbled" to the same line
    Then the system should reject the request with a conflict error (Status 409)
    And it should notify me that the variegation already exists in this line

  Scenario: Allow same variegation names across different lines
    Given a variegation named "Aurea" exists in the genetic line "Line A"
    When I attempt to add a new variegation named "Aurea" to a different genetic line "Line B"
    Then the system should accept the request and save the new variegation

  Scenario: Update a variegation's specific requirements
    Given a variegation named "Mint" exists
    When I update the variegation to adjust its standard configuration (e.g., higher light requirements)
    And I add new notes regarding its stability
    Then the variegation should be updated successfully
    And future labels printed for specimens of this variegation should reflect the new light requirements
