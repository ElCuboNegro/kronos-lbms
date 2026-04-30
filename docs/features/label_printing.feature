Feature: Hardware Label Printing Integration
  As a lab technician
  I want to print physical stickers for specimens and prepared batches
  So that I can label my containers with QRs and metadata for later scanning

  Background:
    Given I am logged into the LBMS
    And the external hardware printer service is running and accessible

  Scenario: Print a label for a botanical Specimen
    Given I am viewing the detail page of a specimen (e.g., a plant)
    When I trigger the "Imprimir Etiqueta" action
    Then the system should resolve the environmental metadata hierarchy (Species -> Line -> Variegation -> Active Experiment)
    And it should compile a payload including:
      | Field        | Source / Logic                               |
      | uid          | The specimen's unique identifier             |
      | especie      | The specimen's species name                  |
      | riego        | Humidity metadata (e.g., "75%")              |
      | luz          | Light requirements in lux                    |
      | temp         | Temperature requirements in Celsius          |
      | ph           | Substrate pH requirement                     |
      | npk          | Fertilizer ratio (e.g., "10-10-10")          |
    And the system should send a print command to the hardware service
    And the service should confirm the print was successful

  Scenario: Print a label for a prepared chemical Batch (Lote)
    Given I have prepared a new batch of a formulation (Lote)
    When I trigger the print action for the Lote
    Then the system should calculate the exact amount of components used based on volume and concentration
    And it should compile a payload including:
      | Field        | Source / Logic                               |
      | uid          | The batch's unique identifier                |
      | nombre       | The formulation's name                       |
      | preparador   | The name of the user who prepared it         |
      | volumen      | Total volume prepared (e.g., "5L")           |
      | concentracion| Concentration multiplier (e.g., "1x")        |
      | componentes  | Comma-separated list of reagents and amounts |
      | peligros     | Aggregated hazard warnings (e.g., Corrosive) |
      | expiracion   | The expiration date of the batch             |
    And the system should send a print command in "reactivo" mode
    And the service should confirm the print was successful

  Scenario: Printer hardware unavailable
    Given the hardware printer service is offline or disconnected
    When I attempt to print any label
    Then the system should fail gracefully after a 15-second timeout
    And I should see an error message "Servicio de impresión no disponible" (Status 503)

  Scenario: Printer hardware error
    Given the hardware printer service is online but encounters a fault (e.g., out of paper)
    When I attempt to print a label
    Then the printer service should return an error
    And the system should display "Error de impresora" with the specific fault details (Status 502)
