Feature: Laboratory Scientific Calculators
  Scenario: Molarity Calculation logic
    Given Target Volume and Target Concentration
    When applying MW from the selected reagent
    Then the UI returns the required mass in grams.
    Proof: frontend/src/pages/Calculators.jsx

  Scenario: C1V1 Dilution
    Given initial and final concentrations
    When calculating required stock volume
    Then the UI applies C1V1 = C2V2.
    Proof: frontend/src/pages/Calculators.jsx
