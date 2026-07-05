# language: es
Característica: Generación de tratamientos a partir de factores y niveles
  El sistema sugiere el producto cartesiano de los niveles como tratamientos,
  más un tratamiento de control, y el usuario puede ajustar antes de confirmar.

  Antecedentes:
    Dado un experimento "Inducción de callo" con tipo de diseño "factorial"
    Y un factor "Sustrato" con niveles "A" y "B"
    Y un factor "Hormona" con niveles "0.5 mg/L" y "1.0 mg/L"

  Escenario: El producto cartesiano genera un tratamiento por combinación
    Cuando el sistema sugiere los tratamientos
    Entonces se generan 4 tratamientos
    Y existe un tratamiento con "Sustrato=A" y "Hormona=0.5 mg/L"
    Y se añade un tratamiento adicional marcado como control

  Escenario: El usuario descarta una combinación antes de confirmar
    Cuando el sistema sugiere los tratamientos
    Y el usuario descarta la combinación "Sustrato=B" con "Hormona=1.0 mg/L"
    Y el usuario confirma el diseño
    Entonces el experimento queda con 3 tratamientos más el control

  Escenario: Un tratamiento admite a lo más un nivel por factor
    Cuando se intenta crear un tratamiento con los niveles "A" y "B" del factor "Sustrato"
    Entonces la operación es rechazada
    Y se informa que un tratamiento admite a lo más un nivel por factor

  Escenario: No se puede borrar un nivel usado por un tratamiento confirmado
    Dado un tratamiento confirmado que usa el nivel "A" del factor "Sustrato"
    Cuando se intenta borrar el nivel "A"
    Entonces la operación es rechazada
