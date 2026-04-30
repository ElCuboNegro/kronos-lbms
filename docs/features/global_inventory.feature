Feature: Unified Laboratory Inventory Management
  As a lab manager or technician
  I want a comprehensive, unified system to track all physical assets
  So that I can manage biological specimens, chemical reagents, and lab equipment using a standardized scanning and logging workflow

  Background:
    Given I am logged into the LBMS

  Scenario: Differentiate between biological and non-biological inventory
    When I view the inventory models
    Then I should recognize two distinct primary ID formats:
      | Entity Type                  | Prefix | Database Model  | Examples                                    |
      | Biological (Plants, Explants)| UID:   | Especimen       | In vitro clones, mother plants, seedlings   |
      | Non-Biological (Equipment)   | ID:    | Elemento        | Microscopes, pH meters, generic consumables |

  Scenario: Register and track lab equipment (Elemento)
    When I register a new inventory element
    And I assign it an ID "ID:EQUIP-001"
    And I set the type to "equipo" and description to "Autoclave Sterilizer"
    Then the equipment should be saved in the database
    And I can print a QR label for this equipment
    And I can log usage or maintenance events specifically for this equipment

  Scenario: Manage inventory quantities and states
    Given an element "ID:CONS-100" exists for "Sterile Scalpels"
    When I update the element to adjust the quantity to 50 and unit to "pcs"
    Then the system should accurately reflect the new inventory level
    And if the item is depleted, I can update its status to "agotado" or "inactivo"

  Scenario: Traceability of items via Events
    Given an element "ID:EQUIP-002" (pH Meter) exists
    When a user performs a calibration
    And the user logs an event of type "mantenimiento" with details about the calibration buffer used
    Then the event should be permanently attached to the equipment's timeline
    And the system should record the timestamp and the user who performed the calibration

  Scenario: Unified scanning integration
    Given I have a QR code for "UID:PLANT-99" and another for "ID:EQUIP-01"
    When I scan either QR code using the global scanner
    Then the system should automatically route the scan:
      | Scanned Code   | Action                                      |
      | UID:PLANT-99   | Opens the Specimen Detail View (Ficha)      |
      | ID:EQUIP-01    | Opens the Element Detail View (Equipos)     |
