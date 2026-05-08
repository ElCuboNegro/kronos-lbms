Feature: Integrated Dilution Calculator
  As a lab technician
  I want to calculate dilutions using compounds directly from the database
  So that I avoid manual entry errors and have consistency in my reagents

  Scenario: Calculate dilution from a database reagent
    Given I am logged in as a technician
    And the following reagents exist in the database:
      | nombre       | concentracion_gl | unidad_medida |
      | Amoxicilina  | 50.0             | g             |
    When I open the "Dilution Calculator"
    And I search for "Amoxicilina" in the database
    And I select "Amoxicilina" from the results
    Then the "Stock Concentration (C1)" field should be automatically filled with "50.0"
    And the "Units" should be "g/L"
    When I input a "Target Concentration (C2)" of "1.0"
    And I input a "Total Solvent Amount" of "250"
    Then the app should calculate the "Required Stock (V1)" as "5.10"
    And the "Total Volume (V2)" should be "255.10"
    And it should show a summary "Add 5.10 ml of Stock to 250.00 ml of Solvent"
