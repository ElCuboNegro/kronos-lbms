Feature: Specimen Inventory Management
  As a lab technician
  I want to register and track biological specimens
  So that I can maintain an accurate, traceable inventory of species, lines, and individuals

  Background:
    Given I am logged into the LBMS

  Scenario: Register a new individual specimen
    When I navigate to the "Nuevo Individuo" page
    And I provide the species, origin line, and a unique UID
    And I submit the registration form
    Then the new specimen should be saved in the database
    And I should be redirected to the specimen's detail page (Ficha)

  Scenario: Register a batch (Lote) of specimens simultaneously
    When I navigate to the "Nuevo Lote" page
    And I select the base formulation or media
    And I specify the quantity of individuals to create
    And I submit the batch registration form
    Then multiple individual specimens should be created simultaneously
    And I should be able to view them in the "Lotes Preparados" list

  Scenario: Log an evolution event for a specimen (Quick Action)
    Given I am viewing the detail page of a specific specimen
    When I click the action to add an evolution record ("📸 Añadir Foto / Evo")
    And I input the current growth metrics, observations, and attach a photo
    And I save the event
    Then the evolution timeline of the specimen should immediately reflect the new record
    And the user who logged the event should be recorded

  Scenario: View hierarchical biological data
    When I navigate to the "Especies" list
    And I select a specific species
    Then I should see details about that species
    And I should see the associated varieties (variegaciones) and lines
