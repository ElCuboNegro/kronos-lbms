Feature: Substrate Composition
  Scenario: Ingredient Validation
    Given a list of chemicals for a substrate
    When the substrate is registered
    Then the system validates concentrations and types.
    Proof: backend/app/routers/sustratos.py
