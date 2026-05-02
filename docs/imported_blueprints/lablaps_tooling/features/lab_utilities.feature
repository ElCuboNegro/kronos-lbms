Feature: Lab Utilities & Scientific Tooling
  As a bench scientist
  I want quick access to standard scientific calculators and trackers
  So that I can perform common lab math and counting without leaving my workflow

  Scenario: Serial Dilution Calculator
    Given the user is on the "Utilities" tab
    And selects the "Serial Dilution" tool
    When the user inputs a Starting Concentration (C1) of "10"
    And inputs a Target Volume (V2) of "100"
    And inputs a Target Concentration (C2) of "1"
    Then the system calculates the Required Volume (V1) as "10"
    And calculates the Diluent Volume as "90"
    And displays the results with a "Copy to Clipboard" action

  Scenario: Cell Culture Viability Counter
    Given the user selects the "Colony Counter" tool
    When the user taps the screen inside the "Live Cells" quadrant 5 times
    And taps inside the "Dead Cells" quadrant 1 time
    Then the system displays "Total Cells: 6"
    And calculates the "Viability" as "83.3%"
    And allows the user to export the count to the current active protocol
