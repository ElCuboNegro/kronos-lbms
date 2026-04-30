Feature: Specimen Genealogy and Lineage Tracking
  As a lab researcher
  I want to track the parentage of specimens (mother and father plants)
  So that I can visualize genealogical trees, trace genetic inheritance, and monitor clonal lineages

  Background:
    Given I am logged into the LBMS

  Scenario: Register a specimen with known parentage
    Given a "Mother Plant" specimen exists with UID "M-001"
    And a "Father Plant" specimen exists with UID "F-001"
    When I register a new individual specimen
    And I set the "Mother" field to "M-001" and the "Father" field to "F-001"
    Then the new specimen should be saved with exact links to both parent records
    And when I view the new specimen's detail card, I should see the UIDs of both parents

  Scenario: Track lineage during bulk cloning (Lote / Bulk Create)
    Given a "Mother Plant" specimen exists with UID "M-002"
    When I perform a bulk creation (cloning) of 10 new specimens
    And I designate "M-002" as the mother for the batch
    Then all 10 new specimens should be saved with "M-002" as their mother
    And an automated "clonacion" event should be logged for each new specimen
    And the new specimens should inherit the environmental configuration of their genetic line

  Scenario: Trace a specimen's ancestry upwards
    Given a specimen "Child-A" exists whose mother is "Mother-A"
    And "Mother-A" exists whose mother is "Grandmother-A"
    When I fetch the details of "Child-A"
    Then the system should return the exact `madre_uid` and `madre_id`
    And the UI should allow me to navigate from "Child-A" directly to "Mother-A" via its UID
    And from "Mother-A", I should be able to navigate to "Grandmother-A", revealing the ascending genealogical path

  Scenario: View descendants of a specimen (Back-references)
    Given a "Mother Plant" specimen exists with UID "M-003"
    And multiple child specimens exist that reference "M-003" as their `madre_id`
    When I query the database via the specimen's relationship capabilities
    Then the system should recognize the back-references (`hijos_madre` and `hijos_padre`)
    And it should be technically possible to visualize a descending tree of all clones or offspring derived from "M-003"
