# language: es
Característica: Trazabilidad de linaje a través de subcultivos
  Cada observación se amarra a la unidad, al número de pase y a los días desde
  la transferencia. Transferir una línea entera la mantiene como una sola
  unidad; dividir un callo crea sublíneas anidadas bajo la unidad madre.

  Escenario: Cada observación queda amarrada a unidad, pase y tiempo
    Dado una unidad experimental "U1" en el subcultivo P2
    Y han pasado 7 días desde la última transferencia
    Cuando se registra una observación de peso fresco
    Entonces la observación referencia a la unidad "U1"
    Y la observación registra el número de pase P2
    Y la observación registra 7 días desde la transferencia

  Escenario: Transferir una línea entera la mantiene como una sola unidad
    Dado una unidad experimental "U1" en el subcultivo P1
    Cuando se transfiere "U1" entera a medio fresco
    Entonces sigue existiendo una sola unidad "U1"
    Y su número de pase avanza a P2

  Escenario: Dividir un callo crea sublíneas anidadas bajo la unidad madre
    Dado una unidad experimental madre "U1"
    Cuando se divide el callo de "U1" en dos sublíneas
    Entonces cada sublínea referencia a "U1" como su unidad padre
    Y cada sublínea es una línea independiente medida en el tiempo
