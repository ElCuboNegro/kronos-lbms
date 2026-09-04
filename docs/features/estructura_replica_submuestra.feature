# language: es
Característica: Separación estructural entre réplica y submuestra
  La unidad experimental y la submuestra son entidades distintas y
  jerárquicamente subordinadas en el modelo de datos, no un campo que
  quede a interpretación del análisis (INV-3).

  Escenario: La submuestra está anidada bajo una unidad experimental
    Dado una unidad experimental "U1"
    Cuando se registra una submuestra de "U1"
    Entonces la submuestra referencia a "U1" como su unidad experimental
    Y la submuestra no puede existir sin una unidad experimental

  Escenario: Una unidad experimental pertenece a un solo tratamiento
    Dado un experimento con los tratamientos "T1" y "T2"
    Y una unidad experimental asignada al tratamiento "T1"
    Cuando se consulta el tratamiento de la unidad
    Entonces la unidad pertenece únicamente a "T1"

  Escenario: Rechazar asignar una unidad a un tratamiento de otro experimento
    Dado un experimento "E1" con el tratamiento "T1"
    Y un experimento "E2" con el tratamiento "T2"
    Y una unidad experimental que pertenece a "E1"
    Cuando se intenta asignar esa unidad al tratamiento "T2"
    Entonces la operación es rechazada
