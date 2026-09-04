# language: es
Característica: Bloqueo para controlar fuentes de ruido conocidas
  Cuando el diseño usa bloques, cada unidad pertenece a un bloque (p. ej. lote
  de autoclave, estante de la cámara o fecha) y el sistema captura esa
  estructura. (Qué variable conviene bloquear es una decisión de diseño del
  investigador, no del sistema.)

  Antecedentes:
    Dado un experimento con tipo de diseño "bloques"

  Escenario: Un diseño por bloques exige declarar un factor de bloqueo
    Dado que el experimento no tiene factor de bloqueo
    Cuando se intenta confirmar el diseño
    Entonces la operación es rechazada
    Y se informa que un diseño por bloques requiere un factor de bloqueo

  Escenario: Cada unidad referencia el bloque al que pertenece
    Dado un factor de bloqueo "lote de autoclave" con niveles "L1" y "L2"
    Cuando se registra una unidad en el bloque "L1"
    Entonces la unidad referencia el bloque "L1"

  Escenario: Rechazar una unidad sin bloque cuando el diseño es por bloques
    Dado un factor de bloqueo "lote de autoclave" con niveles "L1" y "L2"
    Cuando se intenta registrar una unidad sin bloque
    Entonces la operación es rechazada
    Y se informa que el diseño por bloques exige un bloque por unidad
