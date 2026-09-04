# language: es
Característica: Tasas calculadas a nivel de unidad y luego agregadas
  Las tasas (porcentaje de contaminación, de supervivencia, de inducción de
  callo) no se capturan a nivel de tratamiento: se calculan desde el estado
  por unidad experimental y luego se agregan (INV-1).

  Escenario: La tasa de contaminación se calcula desde el estado por unidad
    Dado un tratamiento con 10 unidades experimentales
    Y 3 unidades están marcadas como contaminadas
    Cuando se calcula la tasa de contaminación del tratamiento
    Entonces la tasa es 30 por ciento
    Y la tasa se obtiene como unidades contaminadas dividido entre el total de unidades

  Escenario: Las submuestras no alteran el conteo de la tasa
    Dado un tratamiento con 10 unidades experimentales
    Y 3 unidades contaminadas, cada una con 4 submuestras
    Cuando se calcula la tasa de contaminación del tratamiento
    Entonces la tasa es 30 por ciento

  Escenario: La tasa no se almacena como un dato capturado a nivel de tratamiento
    Dado un tratamiento con unidades experimentales
    Cuando se solicita su tasa de supervivencia
    Entonces la tasa se deriva en el momento desde el estado de las unidades
    Y no proviene de un campo capturado a nivel de tratamiento
