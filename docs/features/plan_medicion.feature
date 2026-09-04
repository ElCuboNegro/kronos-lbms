# language: es
Característica: Plan de medición y tomas pendientes
  El plan define una cadencia y una ventana por variable, contadas desde el
  Día 0 del experimento. La consulta de tomas pendientes informa qué falta
  medir, sin bloquear ni obligar.

  Escenario: Rechazar una cadencia no positiva
    Cuando se define un plan de medición con cadencia de 0 días
    Entonces la operación es rechazada

  Escenario: Rechazar una ventana con fin anterior al inicio
    Cuando se define un plan de medición con día de inicio 14 y día de fin 7
    Entonces la operación es rechazada

  Escenario: Las tomas pendientes informan sin bloquear el registro
    Dado un plan que mide "peso fresco" cada 7 días entre el día 0 y el día 21
    Y una unidad sin mediciones registradas al día 14
    Cuando se consultan las tomas pendientes de la unidad
    Entonces se listan como pendientes las tomas de los días 0, 7 y 14
    Y el sistema no impide registrar otras mediciones
