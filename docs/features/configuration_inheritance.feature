Feature: Hierarchical Configuration Inheritance
  As a lab researcher
  I want standard environmental configurations to cascade down the biological hierarchy
  So that I don't have to manually input standard metrics (like temperature, humidity, or pH) every time I log an evolution or print a label

  Background:
    Given I am logged into the LBMS

  Scenario: Basic Species-level inheritance
    Given a Species exists with a standard configuration:
      | Field | Value |
      | luz_lux | 1500  |
      | ph_sustrato | 6.0 |
    When I create a new specimen belonging to this species directly
    And I log an initial evolution record for it without specifying light or pH
    Then the system should automatically apply 1500 lux and 6.0 pH to the evolution record

  Scenario: Genetic Line overriding Species defaults
    Given a Species exists with `temperatura_c` set to 22.0
    And a Genetic Line exists beneath that Species with `temperatura_c` set to 26.0 (e.g., a tropical line)
    When I create a specimen belonging to this Genetic Line
    And I log an evolution record without specifying temperature
    Then the system should automatically apply 26.0°C to the evolution record, favoring the Line over the Species

  Scenario: Variegation overriding Genetic Line and Species defaults
    Given a Species has `luz_lux` at 1000
    And its Genetic Line has `luz_lux` at 1500
    And a specific Variegation (e.g., "Albo") within that line has `luz_lux` set to 3000 (needs more light)
    When I create a specimen belonging to this Variegation
    And I log an evolution record without specifying light
    Then the system should automatically apply 3000 lux, favoring the Variegation's specific needs

  Scenario: Active Experiment overriding all biological taxonomy defaults
    Given a specimen belongs to a Variegation that mandates 3000 lux
    And the specimen is currently part of an active Experiment designed to test low-light stress (`luz_lux` set to 500 in the experiment config)
    When I log an evolution record for this specimen
    Then the system should automatically apply 500 lux
    And the same override should occur if I print a physical label for this specimen

  Scenario: Partial overwrites in the hierarchy
    Given a Species defines `ph_sustrato` = 5.5 and `luz_lux` = 2000
    And its Variegation only defines `luz_lux` = 3000 (leaves pH undefined)
    When I log an evolution record for a specimen of this variegation
    Then the system should merge the configurations
    And it should apply `ph_sustrato` = 5.5 (from Species) and `luz_lux` = 3000 (from Variegation)

  Scenario: User manual input overrides all defaults
    Given the entire hierarchy (Species -> Line -> Variegation -> Experiment) mandates a temperature of 25.0°C
    When I log an evolution record and manually specify the temperature as 28.0°C
    Then the system should save 28.0°C, prioritizing explicit user input over any inherited defaults
