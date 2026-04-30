Feature: Lab Utility Calculators and Micro-tools
  As a bench scientist
  I want quick access to standard mathematical and tracking utilities directly on my device
  So that I do not have to break my sterile workflow to use a separate calculator or physical counter

  Background:
    Given I am logged into the LBMS Frontend app
    And I am on the "Lab / Utilities" tab

  Scenario: Serial Dilution Calculator (C1V1 = C2V2)
    When I open the "Dilution Calculator"
    And I input a Stock Concentration (C1) of "10x"
    And I input a Target Concentration (C2) of "1x"
    And I input a Target Volume (V2) of "1000ml"
    Then the app should instantly calculate and display that I need "100ml" of Stock (V1)
    And it should tell me to add "900ml" of diluent
    And I should see a button to "Copy to Clipboard" or "Save to formulation batch"

  Scenario: Molarity Calculator
    When I open the "Molarity Calculator"
    And I input the Molecular Weight (MW) of a reagent as "58.44 g/mol" (NaCl)
    And I input my target Volume as "1 L"
    And I input my target Concentration as "0.5 M"
    Then the app should calculate that I need to weigh exactly "29.22 g" of the reagent

  Scenario: Cell Culture Viability Counter (Live/Dead)
    When I open the "Cell Counter" tool
    Then I should see large, easily tappable areas on the screen for "Live" (Green) and "Dead" (Red)
    When I tap "Live" 85 times and "Dead" 15 times while looking through the microscope
    Then the app should calculate a total count of 100 cells
    And it should calculate and display a viability of "85%"
    And the counters should feature haptic feedback or subtle audio clicks so I don't have to look at my screen

  Scenario: Colony Counter (CFU)
    When I open the "Colony Counter"
    And I use the screen to tally colonies on a petri dish
    And I input the dilution factor (e.g., 10^-4) and the plated volume (e.g., 0.1 ml)
    Then the app should calculate the CFU/ml of the original sample
    And I should be able to attach this calculated result directly to a Specimen's "Registro de Evolucion"
