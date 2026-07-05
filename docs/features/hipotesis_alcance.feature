# language: es
Característica: Declaración de hipótesis y alcance del experimento
  El experimento declara su hipótesis —incluida la diferencia mínima a
  detectar, que alimenta el cálculo del n— y su alcance, es decir, los
  límites de generalización de las conclusiones.

  # La hipótesis no es decorativa: su "diferencia mínima a detectar"
  # es una entrada obligatoria del cálculo del n.
  Escenario: La diferencia mínima a detectar viene de la hipótesis
    Dado un experimento cuya hipótesis fija una diferencia mínima a detectar de 15%
    Cuando se calcula el n del experimento
    Entonces el cálculo usa 15% como diferencia mínima a detectar

  Escenario: No se puede calcular el n sin una diferencia mínima declarada
    Dado un experimento sin diferencia mínima a detectar declarada
    Cuando se intenta calcular el n
    Entonces la operación es rechazada
    Y se informa que falta declarar la diferencia mínima a detectar

  # Alcance — el caso del clon de una sola planta madre:
  # sin distintas madres no hay réplica biológica de la población.
  Escenario: Marcar alcance limitado cuando todas las unidades vienen de una sola planta madre
    Dado un experimento donde todas las unidades provienen de la planta madre "PM1"
    Cuando se registra el alcance del experimento
    Entonces el sistema advierte que no hay réplica biológica de la población
    Y el alcance queda limitado al clon de "PM1"
