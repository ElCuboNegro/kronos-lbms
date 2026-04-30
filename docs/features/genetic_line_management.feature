Feature: Genetic Line Management
  As a lab researcher
  I want to define and manage specific genetic lines within a species
  So that I can track distinct lineages, their propagation methods, and their inherited environmental requirements

  Background:
    Given I am logged into the LBMS
    And a species "Philodendron gloriosum" exists in the system

  Scenario: Register a new genetic line
    When I add a new genetic line named "Dark Form" to the species
    And I specify the propagation method as "clonacion"
    And I provide an optional description and standard configuration
    Then the new genetic line should be saved successfully
    And it should be linked hierarchically beneath the "Philodendron gloriosum" species

  Scenario: Prevent duplicate genetic lines within the same species
    Given a genetic line named "Zebra" already exists for the species
    When I attempt to register another line named "Zebra" under the same species
    Then the system should reject the request with a conflict error (Status 409)
    And it should notify me that the line already exists within this species

  Scenario: Update a genetic line's configuration
    Given a genetic line "Zebra" exists
    When I update the line to change its propagation method to "semilla"
    And I adjust its standard environmental configuration (e.g., target humidity)
    Then the genetic line should be updated
    And any new specimens or bulk clones generated from this line should inherit these new environmental configurations

  Scenario: View hierarchy beneath a genetic line
    Given a genetic line "Dark Form" exists
    And it has multiple associated variegations (e.g., "Variegated", "Solid")
    And it has multiple direct individual specimens
    When I view the details of the "Philodendron gloriosum" species or query the line directly
    Then I should see the "Dark Form" line
    And I should see a count or list of all its specific variegations
    And I should see the total aggregate count of all individuals belonging to this line and its sub-variegations
