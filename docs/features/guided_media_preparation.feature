Feature: Preparación Guiada de Formulaciones (Media Maker Run Mode)
  Como técnico de laboratorio
  Quiero un flujo interactivo paso a paso al preparar un medio o buffer (Formulación)
  Para evitar errores de cálculo en el escalado, asegurar que no olvido ningún reactivo, y poder registrar el pH final y la trazabilidad de forma estructurada.

  Background:
    Given I am logged into the LBMS
    And exist una formulación llamada "Medio MS" en el Recetario

  Scenario: Iniciar preparación y configurar volumen (Escalado automático)
    Given I click "Preparar este medio" en "Medio MS"
    When the "Step 1: Configuración" is expanded
    And I enter "2" in "Volumen Final (L)"
    Then the system dynamically updates the required quantities in "Step 2: Pesaje" multiplying the base amounts by 2
    And "Step 1" marks as completed when I click "Siguiente"

  Scenario: Checklist de ingredientes (Mise en place)
    Given I am on "Step 2: Pesaje y Mezcla"
    Then I see a checklist of all components with their scaled quantities
    When I check off "Nitratro de amonio (3.3g)"
    Then it visually strikes through, indicating it has been added to the beaker
    And I can input the source batch barcode in the traceability field for that component

  Scenario: Registrar pH y completar el lote
    Given I have completed the components checklist
    When I expand "Step 3: Procedimiento y Cierre"
    And I input "5.8" in the "pH Final" field
    And I click "Registrar Preparación y Crear Lote"
    Then the backend receives the payload with the scaled volume, pH, and traceability data
    And a new "Lote Preparado" is created in the global inventory
    And the UI offers me a button to print the container label
