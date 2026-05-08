Feature: QR Scanner Resolver
  As a researcher
  I want to resolve different types of QR codes
  To quickly access information about specimens, elements, reagents, and containers.

  Scenario: Resolve Specimen by UID prefix (Success)
    Given a QR code starting with "UID:" (e.g., "UID:P001")
    And the specimen with UID "P001" exists in the database
    When the user scans the QR code
    Then the system returns a scan result of type "especimen" (line 21-36)

  Scenario: Resolve Specimen by UID prefix (Not Found)
    Given a QR code starting with "UID:" (e.g., "UID:MISSING")
    And the specimen with UID "MISSING" does not exist
    When the user scans the QR code
    Then the system raises a 404 error "Espécimen con UID 'MISSING' no encontrado" (line 37)

  Scenario: Resolve Element by ID prefix (Success)
    Given a QR code starting with "ID:" (e.g., "ID:E001")
    And the element with ID "E001" exists in the database
    When the user scans the QR code
    Then the system returns a scan result of type "elemento" (line 39-48)

  Scenario: Resolve Element by ID prefix (Not Found)
    Given a QR code starting with "ID:" (e.g., "ID:MISSING")
    And the element with ID "MISSING" does not exist
    When the user scans the QR code
    Then the system raises a 404 error "Elemento con ID 'MISSING' no encontrado" (line 49)

  Scenario: Resolve Prepared Batch by REAC- prefix (Success)
    Given a QR code starting with "REAC-" (e.g., "REAC-2023-01")
    And the prepared batch exists in the database
    When the user scans the QR code
    Then the system returns a scan result of type "lote" (line 51-58)

  Scenario: Resolve Prepared Batch by REAC- prefix (Not Found)
    Given a QR code starting with "REAC-" (e.g., "REAC-MISSING")
    And the prepared batch does not exist
    When the user scans the QR code
    Then the system raises a 404 error "Lote Preparado con UID 'REAC-MISSING' no encontrado" (line 59)

  Scenario: Resolve Container by CONT- prefix (Success)
    Given a QR code starting with "CONT-" (e.g., "CONT-Shelf1")
    And there are specimens associated with container "CONT-Shelf1"
    When the user scans the QR code
    Then the system returns a scan result of type "contenedor" including the list of specimens (line 61-71)

  Scenario: Resolve Container by CONT- prefix (Empty/Not Found)
    Given a QR code starting with "CONT-" (e.g., "CONT-Empty")
    And no specimens are found in container "CONT-Empty"
    When the user scans the QR code
    Then the system raises a 404 error "Contenedor 'CONT-Empty' vacío o no encontrado" (line 72)

  Scenario: Resolve Reagent by STOCK- prefix (Success)
    Given a QR code starting with "STOCK-" (e.g., "STOCK-123")
    And the reagent with ID "123" exists
    When the user scans the QR code
    Then the system returns a scan result of type "reactivo" (line 74-79)

  Scenario: Resolve Reagent by STOCK- prefix (Not Found)
    Given a QR code starting with "STOCK-" (e.g., "STOCK-999")
    And the reagent with ID "999" does not exist
    When the user scans the QR code
    Then the system raises a 404 error "Reactivo con ID '999' no encontrado" (line 80)

  Scenario: Resolve Substrate by SUST- prefix (Success)
    Given a QR code starting with "SUST-" (e.g., "SUST-ABC")
    And the substrate with code "ABC" exists
    When the user scans the QR code
    Then the system returns a scan result of type "sustrato" (line 82-87)

  Scenario: Resolve Substrate by SUST- prefix (Not Found)
    Given a QR code starting with "SUST-" (e.g., "SUST-MISSING")
    And the substrate with code "MISSING" does not exist
    When the user scans the QR code
    Then the system raises a 404 error "Sustrato con código 'MISSING' no encontrado" (line 88)

  Scenario: Fallback to direct UID lookup (Success)
    Given a QR code that does not match any prefix or prefix lookup failed
    And a specimen exists with UID equal to the scanned string
    When the user scans the QR code
    Then the system returns a scan result of type "especimen" (line 91-105)

  Scenario: Fallback to factory barcode lookup (Success)
    Given a QR code that does not match any prefix and direct UID lookup failed
    And a reagent exists with this factory barcode
    When the user scans the QR code
    Then the system returns a scan result of type "reactivo" (line 108-112)

  Scenario: Unknown QR code
    Given a QR code that does not match any of the above criteria
    When the user scans the QR code
    Then the system returns a scan result of type "desconocido" (line 114)
