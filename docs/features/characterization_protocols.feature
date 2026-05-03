Feature: Protocolos de Caracterización de Insumos
  Como técnico de laboratorio
  Quiero ejecutar protocolos de medición estandarizados (ej. pH de sustratos)
  Para normalizar la calidad de los materiales antes de usarlos en experimentos.

  Scenario: Ejecutar medición de pH en Turba (Método 1:2)
    Given que el usuario selecciona "Caracterización de pH (Turba)"
    When el sistema inicia el "Paso 1: Preparación"
    Then muestra las cantidades: 50cc de turba y 100ml de agua destilada
    When el usuario confirma la mezcla
    And se activa el "Paso 2: Equilibrio Químico"
    Then un temporizador de "60:00" minutos comienza a correr
    And la app impide el registro del pH hasta que el tiempo termine (o lanza una advertencia)
    When el tiempo termina y el usuario introduce el "pH Observado"
    Then el sistema guarda la medición y calcula si la turba es apta (pH < 5.0) o no.
