Feature: Label Printing and UID Generation
  As a researcher
  I want to print labels for specimens, reagents, and containers
  And generate unique identifiers for new specimens.

  Scenario: Print Specimen Label (Success with Metadata Hierarchy)
    Given a valid specimen ID
    And the specimen is associated with an active experiment, variegation, line, and species
    When the user requests to print the specimen label
    Then the system aggregates metadata in the hierarchy: Species < Line < Variegation < Experiment (line 27-53)
    And sends the formatted payload to the printer service (line 64-73)

  Scenario: Print Specimen Label (Not Found)
    Given a non-existent specimen ID
    When the user requests to print the specimen label
    Then the system raises a 404 error "Espécimen no encontrado" (line 21)

  Scenario: Print Specimen Label (Printer Error)
    Given the printer service returns a non-200 status
    When the user requests to print a specimen label
    Then the system raises a 502 error "Error de impresora" (line 74)

  Scenario: Print Specimen Label (Printer Service Down)
    Given the printer service is unreachable
    When the user requests to print a specimen label
    Then the system raises a 503 error "Servicio de impresión no disponible" (line 77)

  Scenario: Print Reagent Label (Success)
    Given a valid reagent ID
    When the user requests to print the reagent label
    Then the system formats the reagent data and sends it to the printer (line 90-108)

  Scenario: Print Reagent Label (Not Found)
    Given a non-existent reagent ID
    When the user requests to print the reagent label
    Then the system raises a 404 error "Reactivo no encontrado" (line 88)

  Scenario: Print Substrate Label (Success)
    Given a valid substrate ID
    When the user requests to print the substrate label
    Then the system formats the substrate data and sends it to the printer (line 125-139)

  Scenario: Print Substrate Label (Not Found)
    Given a non-existent substrate ID
    When the user requests to print the substrate label
    Then the system raises a 404 error "Sustrato no encontrado" (line 123)

  Scenario: Print Container Label (Success)
    Given a container UID with associated specimens
    When the user requests to print the container label
    Then the system summarizes the contents and sends it to the printer (line 157-171)

  Scenario: Print Container Label (Empty)
    Given a container UID with no specimens
    When the user requests to print the container label
    Then the system raises a 404 error "No hay especímenes asociados a este contenedor" (line 154)

  Scenario: Print Batch Label (Success)
    Given a valid prepared batch ID
    When the user requests to print the batch label
    Then the system calculates component ratios and sends it to the printer (line 189-214)

  Scenario: Print Batch Label (Not Found)
    Given a non-existent batch ID
    When the user requests to print the batch label
    Then the system raises a 404 error "Lote no encontrado" (line 186)

  Scenario: Generate UID (Success)
    Given a valid species ID
    When the user requests a new UID
    Then the system generates a UID with format CODE-YYMMDD-HHMMSS-INDEX (line 234-241)
    And increments the index if another UID was generated in the same second (line 244-255)

  Scenario: Generate UID (Species Not Found)
    Given a non-existent species ID
    When the user requests a new UID
    Then the system raises a 404 error "Especie no encontrada" (line 232)
