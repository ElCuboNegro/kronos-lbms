# language: es
Característica: Selección de variables de respuesta desde el catálogo fijo
  El usuario elige qué variables medir desde un catálogo fijo (Anexo A) y no
  puede inventar nuevas. Cada variable conserva su tipo de dato y su nivel.

  Escenario: El usuario selecciona variables del catálogo
    Dado el catálogo de variables de respuesta del Anexo A
    Cuando el usuario selecciona "peso fresco" y "porcentaje de inducción"
    Entonces el experimento queda con esas dos variables de respuesta

  Escenario: Rechazar una variable que no está en el catálogo
    Dado el catálogo de variables de respuesta del Anexo A
    Cuando el usuario intenta agregar la variable "color subjetivo", que no está en el catálogo
    Entonces la operación es rechazada
    Y se informa que no se pueden crear variables fuera del catálogo

  Escenario: Cada variable seleccionada conserva su tipo y su nivel del catálogo
    Dado el catálogo de variables de respuesta del Anexo A
    Cuando el usuario selecciona "porcentaje de inducción"
    Entonces la variable conserva su tipo de dato "tasa"
    Y conserva el nivel de cálculo definido en el catálogo
