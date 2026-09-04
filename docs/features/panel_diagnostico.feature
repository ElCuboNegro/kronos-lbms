# language: es
Característica: Panel de diagnóstico de mis cultivos
  Como científica del laboratorio
  Quiero ver al entrar qué va bien y qué va mal con mis cultivos
  Para no pasar por alto contaminación ni revisiones pendientes

  Antecedentes:
    Dado que estoy autenticada en el LBMS

  Escenario: La contaminación confirmada aparece como alerta
    Dado un espécimen activo con un evento de contaminación "confirmada"
    Cuando pido el diagnóstico
    Entonces la alerta de contaminación incluye ese espécimen

  Escenario: Germinación tardía solo cuando hay valor esperado y se superó
    Dado una especie con "dias_germinar" esperado de 21
    Y un espécimen de esa especie sembrado hace 25 días sin germinar
    Cuando pido el diagnóstico
    Entonces la alerta de germinación tardía incluye ese espécimen

  Escenario: Sin valor esperado no hay falsa alarma de germinación
    Dado una especie sin "dias_germinar" definido
    Y un espécimen de esa especie sembrado hace 60 días sin germinar
    Cuando pido el diagnóstico
    Entonces la alerta de germinación tardía no incluye ese espécimen

  Escenario: El recordatorio de revisión aparece los miércoles
    Cuando pido el diagnóstico un miércoles
    Entonces el recordatorio de revisión está activo

  Escenario: El recordatorio de revisión no aparece otros días
    Cuando pido el diagnóstico un jueves
    Entonces el recordatorio de revisión no está activo
