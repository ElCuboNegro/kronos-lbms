Feature: Anotación y Mapeo de Placas (Plate Mapping)
  Como investigador o técnico de laboratorio
  Quiero una representación visual interactiva de una placa (ej. 96 pocillos)
  Para poder asignar visualmente muestras (especímenes del LBMS), colores y notas, evitando errores de pipeteo y facilitando el tracking.

  Background:
    Given que el usuario está en la herramienta de "Mapa de Placa"
    And se ha seleccionado el formato de "Placa de 96 pocillos (8x12)"

  Scenario: Selección única y apertura del panel de edición
    Given que el usuario visualiza la cuadrícula vacía
    When el usuario hace clic en el pocillo "A1"
    Then el pocillo "A1" se marca como seleccionado (resaltado visualmente)
    And se despliega el panel inferior (Bottom Sheet) de edición de pocillos
    And el panel indica que se está editando "A1"

  Scenario: Asignar color y espécimen a un pocillo
    Given que el pocillo "A1" está seleccionado y el panel de edición está abierto
    When el usuario selecciona el color "Azul"
    And el usuario asigna el título "Control Positivo" (idealmente vinculado a un ID del LBMS)
    Then el pocillo "A1" en la cuadrícula cambia a color "Azul"
    And la placa guarda el metadato del pocillo

  Scenario: Selección múltiple (Batch editing)
    Given que el usuario hace clic en "A1", luego en "A2" y "A3" (con tecla Shift o drag)
    Then los tres pocillos quedan resaltados
    And el panel inferior indica que se están editando "Múltiples pocillos (3)"
    When el usuario asigna el color "Rojo"
    Then los pocillos "A1", "A2" y "A3" cambian a color "Rojo" simultáneamente

  Scenario: Limpiar el mapa
    Given que la placa tiene datos en los pocillos "A1" y "A2"
    When el usuario presiona el botón "Limpiar mapa"
    And confirma la acción de borrado
    Then todos los pocillos de la placa vuelven a su estado vacío (sin color ni título)
