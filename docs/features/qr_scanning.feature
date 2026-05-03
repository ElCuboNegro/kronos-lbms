Feature: QR and UID Label Scanning
  As a lab technician
  I want to scan QR codes on physical lab items
  So that I can quickly identify specimens and elements or register new ones

  Background:
    Given I am logged into the LBMS
    And I am on the "Scan" tab

  Scenario: Successfully identify a known Specimen
    When I scan a QR code with the data "UID:12345"
    And the specimen exists in the system
    Then I should see a result box with the specimen's species and UID
    And I should see a primary action button "Ver Ficha"
    And I should see an accent action button "📸 Añadir Foto / Evo"

  Scenario: Successfully identify a known Element (Reagent/Equipment)
    When I scan a QR code with the data "ID:REACT-001"
    And the element exists in the system
    Then I should see a result box with the element's description and ID
    And I should see a primary action button "Ver Ficha"
    But I should not see the "Añadir Foto / Evo" button

  Scenario: Scan an unknown Specimen UID
    When I scan a QR code with the data "UID:NEW-999"
    And the specimen does not exist in the system
    Then I should see an error message "QR no reconocido por el sistema" or "no encontrado"
    And I should see a prominent button "Registrar este espécimen"

  Scenario: Quick register from an unknown scan
    Given I have scanned an unknown specimen with UID "UID:NEW-999"
    When I click "Registrar este espécimen"
    Then I should be redirected to the new individual creation form
    And the UID field should be pre-filled with "NEW-999"

  Scenario: Invalid QR format handling
    When I scan a QR code with invalid formatting
    Then I should see an error message "QR no reconocido por el sistema"
    And I should see a "Reintentar" button to scan again

  Scenario: Unknown generic barcode (reagent bottle) prompts to add to inventory
    Given I am logged into the LBMS
    And I scan a generic factory barcode "7501031311309"
    And the barcode does not exist in the database
    Then I should see an error message indicating the QR/Barcode is not recognized
    And I should see a button to "Registrar en Inventario de Reactivos"
