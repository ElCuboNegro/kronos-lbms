Feature: Botanical Substrate and Growth Media Management
  As a lab researcher
  I want to define and manage growth substrates and media compositions
  So that I can track which materials are being used for cultivation and their theoretical properties

  Background:
    Given I am logged into the LBMS
    And I am on the "Gestión de Laboratorio" dashboard

  Scenario: Register a new growth substrate or agar medium
    When I create a new substrate entry
    And I provide a unique formulation code (e.g., "SUB-AGAR-MS")
    And I select the type (e.g., "agar", "sustrato", "hidroponia")
    And I define theoretical properties like `ph_teorico` and `conductividad_teorica`
    Then the substrate should be saved in the catalog
    And it should be available for selection in evolution logs

  Scenario: Prevent duplicate formulation codes for substrates
    Given a substrate with code "SUB-001" already exists
    When I attempt to register another substrate with the same code "SUB-001"
    Then the system should reject the request with a conflict error (409)

  Scenario: Associate a specimen with a specific substrate during evolution
    Given a specimen exists
    And several validated substrates (e.g., "Akadama", "Sphagnum") are in the catalog
    When I log a new evolution entry for the specimen
    And I select "Sphagnum" as the current substrate
    Then the evolution record should be linked to that specific substrate ID
    And the history should reflect that the specimen is growing in "Sphagnum"

  Scenario: View substrate properties from the dashboard
    When I view the "Formulaciones de Medios / Sustratos" list
    Then I should see a list of all substrates sorted by name
    And each entry should display its formulation code and categorized type badge
