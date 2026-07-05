# language: es
Característica: Tipo de diseño del experimento
  El experimento declara su tipo de diseño desde un conjunto permitido.
  Un tipo desconocido se rechaza. (El caso "bloques", que exige estructura
  de bloque adicional, se verifica en bloqueo.feature.)

  Esquema del escenario: Tipos de diseño permitidos
    Cuando se crea un experimento con tipo de diseño "<tipo>"
    Entonces el experimento queda registrado con tipo de diseño "<tipo>"

    Ejemplos:
      | tipo      |
      | dca       |
      | factorial |
      | bloques   |

  Escenario: Rechazar un tipo de diseño desconocido
    Cuando se crea un experimento con tipo de diseño "improvisado"
    Entonces la operación es rechazada
    Y se informa que el tipo de diseño no está permitido
