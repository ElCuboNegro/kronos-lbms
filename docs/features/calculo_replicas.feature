# language: es
Característica: Cálculo del n y de la variabilidad con réplicas verdaderas
  El n y la varianza se derivan siempre de la unidad experimental.
  Las submuestras se promedian a un valor por unidad y nunca cuentan
  como réplicas ni como variación independiente (INV-1, INV-2).

  # --- INV-1: el n cuenta unidades, nunca submuestras ---
  # 5 frascos con 3 explantes cada uno = 15 explantes en total.
  # El n correcto es 5 (frascos), NO 15 (explantes). El "no es 15"
  # atrapa el error clásico de pseudorreplicación.
  Escenario: El n cuenta unidades experimentales, no submuestras
    Dado un tratamiento con 5 unidades experimentales
    Y cada unidad tiene 3 submuestras
    Cuando se calcula el n del tratamiento
    Entonces el n es 5
    Y el n no es 15

  # Mismo principio, corrido con tres juegos de datos.
  # Cómo leer la tabla:
  #   - 'unidades' y 'n_esperado' son IGUALES en cada fila:
  #     afirma que el n siempre iguala al número de unidades.
  #   - 'submuestras' VARÍA (3, 1, 10) sin mover el resultado:
  #     afirma que las submuestras no afectan el n.
  #   - Fila crítica: 4 unidades x 10 submuestras = 40 explantes,
  #     y aun así el n es 4. Si el sistema contara explantes, falla aquí.
  Esquema del escenario: El n depende solo de las unidades independientes
    Dado un tratamiento con <unidades> unidades experimentales
    Y cada unidad con <submuestras> submuestras
    Cuando se calcula el n del tratamiento
    Entonces el n es <n_esperado>

    Ejemplos:
      | unidades | submuestras | n_esperado |
      | 5        | 3           | 5          |
      | 8        | 1           | 8          |
      | 4        | 10          | 4          |

  # --- INV-1 (eje temporal): los pases de una misma línea no son réplicas ---
  # 6 líneas medidas en P0, P1 y P2 son 18 mediciones, pero NO 18 réplicas:
  # es la misma línea seguida en el tiempo. El n sigue siendo 6.
  Escenario: Los subcultivos de una misma línea no inflan el n
    Dado un tratamiento con 6 unidades experimentales
    Y cada unidad ha pasado por los subcultivos P0, P1 y P2
    Cuando se calcula el n del tratamiento
    Entonces el n es 6

  # --- INV-2: la varianza se toma entre unidades, tras promediar submuestras ---
  # Primero se colapsan las submuestras a un valor por unidad; luego se mide
  # la dispersión ENTRE unidades. La dispersión dentro de un frasco no entra
  # como variación independiente (subestimaría el error).
  Escenario: La varianza se calcula entre unidades, no entre submuestras
    Dado un tratamiento con varias unidades experimentales
    Y cada unidad tiene varias submuestras medidas
    Cuando se estima la variabilidad para el cálculo de réplicas
    Entonces primero se promedian las submuestras a un valor por unidad
    Y la varianza se calcula entre las unidades del mismo tratamiento
    Y la dispersión dentro de un mismo frasco no entra como variación independiente

  # --- n vinculante: la variable de respuesta más exigente manda ---
  # Si "peso fresco" necesita 6 y "% inducción" necesita 10, montar 6 dejaría
  # corta a la inducción. El n vinculante es el MAYOR (10), para que ninguna
  # variable quede sin poder estadístico. El 80% y 0.05 se fijan para que el
  # resultado sea determinado.
  Escenario: Se reporta como n vinculante el de la variable más exigente
    Dado un poder objetivo de 80% y una significancia de 0.05
    Y la variable "peso fresco" requiere 6 unidades por tratamiento
    Y la variable "porcentaje de inducción" requiere 10 unidades por tratamiento
    Cuando se calcula el n del experimento
    Entonces el n vinculante por tratamiento es 10
