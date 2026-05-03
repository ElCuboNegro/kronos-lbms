Feature: Ejecución de Protocolos y Temporizadores Concurrentes (Run Mode)
  Como científico de laboratorio
  Quiero ver los pasos de mi protocolo en un formato interactivo de acordeón con temporizadores integrados
  Para poder ejecutar incubaciones simultáneas (ej. múltiples muestras) sin salir de la vista del experimento.

  Background:
    Given que el usuario está en la vista de ejecución del experimento ("/experimentos/:id/run")
    And el paso actual tiene temporizadores configurados

  Scenario: Iniciar un único temporizador
    Given que el usuario ve una "Muestra 1" con un temporizador de "05:00"
    When el usuario hace clic en el botón "Play" de la "Muestra 1"
    Then el temporizador comienza a decrecer
    And el botón cambia a estado "Pausa"
    And se programa una notificación local para dentro de 5 minutos

  Scenario: Iniciar temporizadores concurrentes usando el control maestro
    Given que el usuario tiene "Muestra 1", "Muestra 2" y "Muestra 3", todas con temporizadores detenidos
    When el usuario hace clic en "Iniciar todos los temporizadores"
    Then los tres temporizadores comienzan a decrecer simultáneamente
    And la UI muestra un indicador visual de actividad (Wakelock activado)

  Scenario: Pausar y reanudar temporizadores de forma segura
    Given que un temporizador está corriendo y le quedan "03:00"
    When el usuario hace clic en "Pausa"
    Then la cuenta regresiva se detiene en "03:00"
    And la notificación local previamente programada es cancelada
    When el usuario hace clic en "Play" nuevamente
    Then el temporizador se reanuda desde "03:00"
    And se programa una nueva notificación local para dentro de 3 minutos

  Scenario: Precisión en segundo plano (Backgrounding)
    Given que un temporizador está corriendo y le quedan "04:00"
    When el usuario minimiza la aplicación (pasa a segundo plano)
    And espera "01:00" minuto
    And el usuario vuelve a abrir la aplicación (pasa a primer plano)
    Then el temporizador debe mostrar "03:00" restantes (calculado usando Date.now(), no setInterval)
