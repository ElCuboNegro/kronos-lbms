Feature: Trazabilidad y Linaje (Generación de Explantes)
  Como investigador en el laboratorio
  Quiero poder generar un nuevo individuo (explante) directamente desde la ficha de una planta madre
  Para asegurar que el linaje se mantenga automáticamente sin errores de entrada manual.

  Background:
    Given que el usuario está visualizando el detalle de un espécimen (Planta Madre)

  Scenario: Iniciar creación de explante desde planta madre
    When el usuario hace clic en el botón "Generar Explante" (o "Propagar")
    Then el sistema navega al formulario de creación de nuevo individuo
    And el campo "Planta Madre" está pre-completado con el UID de la planta de origen
    And el campo "Especie" está pre-completado con la especie de la planta de origen
    And el usuario puede completar el resto de los datos y guardar el nuevo individuo
