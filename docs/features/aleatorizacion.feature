# language: es
Característica: Aleatorización de la asignación de unidades a tratamientos
  Las unidades experimentales se asignan a los tratamientos al azar, y el
  sistema registra el método para que la asignación sea reproducible y
  auditable. (Qué método de aleatorización es el adecuado lo define el
  diseño; este archivo solo verifica que el sistema lo capture y lo respete.)

  Antecedentes:
    Dado un experimento "Inducción de callo" con 3 tratamientos confirmados
    Y 12 unidades experimentales disponibles

  Escenario: La asignación al azar reparte cada unidad en un solo tratamiento
    Cuando se aleatoriza la asignación con la semilla 42
    Entonces cada una de las 12 unidades queda asignada a exactamente un tratamiento
    Y cada tratamiento recibe 4 unidades

  # Reproducibilidad: misma semilla, misma asignación (clave para auditar)
  Escenario: La asignación es reproducible con la misma semilla
    Cuando se aleatoriza la asignación con la semilla 42
    Y se aleatoriza de nuevo la asignación con la semilla 42
    Entonces ambas asignaciones son idénticas

  Escenario: Semillas distintas producen asignaciones distintas
    Cuando se aleatoriza la asignación con la semilla 42
    Y se aleatoriza de nuevo la asignación con la semilla 7
    Entonces las dos asignaciones no son idénticas

  Escenario: El sistema registra el método y la semilla de aleatorización
    Cuando se aleatoriza la asignación con la semilla 42
    Entonces el experimento guarda el método de aleatorización empleado
    Y guarda la semilla 42 para poder auditar la asignación
