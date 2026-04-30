Feature: Laboratory Reagent and Media Formulation
  As a lab scientist
  I want to manage chemical reagents and complex media formulations
  So that I can ensure precision in preparation and full traceability of lab batches

  Background:
    Given I am logged into the LBMS

  Scenario: Manage the chemical reagent catalog
    When I add a new reagent (e.g., "Agar-Agar", "IAA Hormone", "KMS Salts")
    And I specify its chemical formula, brand, purity, and hazard warnings (peligrosidad)
    Then the reagent should be saved and available for recipes

  Scenario: Define a complex media formulation (Recipe)
    When I create a new Formulation (e.g., "Murashige & Skoog (MS) 1x")
    And I specify the base volume (e.g., 1.0L) and expiration days
    And I add multiple reagents with their required base quantities
    Then the formulation should be saved as a reusable recipe (Recetario)

  Scenario: Prepare a specific batch (Lote) from a formulation
    Given a formulation "MS Medium" exists with a 1.0L base volume
    When I prepare a new Batch (Lote) of "MS Medium"
    And I specify a target volume of 5.0L and a concentration of 2.0x
    Then the system should automatically calculate the proportional quantities of all reagents needed
    And it should generate a unique Batch UID (Lote UID)
    And it should set an expiration date based on the formulation's rules
    And the batch should be recorded as "disponible"

  Scenario: Traceability of chemical provider lots during batch preparation
    Given a formulation "MS Medium" exists that requires a specific phytohormone
    When I prepare a new Batch (Lote) of "MS Medium"
    And I provide the external manufacturer's lot number for the phytohormone used (e.g., "Sigma-Aldrich Lot #12345")
    Then the batch should be saved successfully
    And the system should permanently link the manufacturer's lot number to this internal Batch UID
    And if an experiment fails due to damaged phytohormones, I can query the system to find exactly which Lote contained that supplier's batch

  Scenario: Traceability of prepared media
    When I view the "Lotes Preparados" list
    Then I should see the history of all prepared batches
    And I should see who prepared them, the final pH measured, and their current availability status
    And I should be able to view the exact composition of any specific batch
