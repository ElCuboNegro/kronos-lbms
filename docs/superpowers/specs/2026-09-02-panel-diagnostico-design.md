# Panel de diagnóstico de mis cultivos — Diseño

**Fecha:** 2026-09-02 (actualizado 2026-09-03)
**Autor:** Juan José Alban / usuaria del laboratorio (con Claude Code)
**Estado:** APROBADO (diseño completo) — Parte 1 y Parte 2 aprobadas; reglas de alerta confirmadas; secciones técnicas resueltas. Listo para plan de implementación.

## Objetivo

Que al **entrar** a la plataforma, la científica vea de un vistazo **qué va bien y qué va mal con SUS propios cultivos**, para que **no se le pase ningún dato importante** (contaminación, algo que necesita atención). Es la segunda de las dos piezas "hacer la plataforma más científica / que me aporte" (la primera es *Artículos científicos por especie*, ver `2026-08-24-articulos-cientificos-por-especie-design.md`).

## Enfoque elegido

**Camino 1 — Tablero de inicio (APROBADO).** Una pantalla que se ve al entrar, con TODOS los cultivos de un vistazo. (Se descartó el Camino 2, "diagnóstico dentro de cada especie", porque no da la vista general y sí se podría pasar algo.)

## Contenido del panel (Parte 1 — APROBADA)

Tres secciones, en este orden (lo urgente primero):

**① Lo que necesita tu atención** (arriba del todo — para que nada se pase):
- 🔴 **Contaminación** — frascos/tandas contaminados o sospechosos, con acción **"Marcar contaminado"**.
- 🟡 **Germinación tardía / no germinó** — pasó el tiempo esperado y no germina.
- 🔵 **Sin revisar** — frascos activos sin registro desde la última revisión semanal (ver Parte 2).

**② ¿Qué método de desinfección funciona mejor?** — cruce **método ↔ resultado**: por cada método (p. ej. agua oxigenada 3% vs alcohol 70% + clorox 2%), cuántas tandas germinaron y cuántas se contaminaron. Muestra un **hallazgo** en lenguaje claro (ej.: "con tus datos, el agua oxigenada no dio contaminación; el alcohol+clorox contaminó todo"). Conecta con la hipótesis de desinfección del diseño factorial.

**③ Germinación y crecimiento (vs. lo que tú esperas)** — por cultivo: cuántas germinaron, días a germinar, altura, y estado comparado con lo esperado (a tiempo / lento / por definir).

Los números **siempre salen de los registros reales** (no se inventan). Si aún no hay valor esperado para una especie, se muestra "por definir".

## Valores esperados y recordatorio semanal (Parte 2 — APROBADA)

Motivación: lo "esperado" no puede estar fijo; debe ser **configurable y reutilizable** para cualquier usuario/especie. Elegido: **la usuaria define los valores** (no aprendizaje automático por ahora).

**Por especie** (la usuaria captura):
- **Días esperados para germinar** — dispara "germinación tardía".
- **Altura esperada (opcional): N mm a los M días** — dispara "crecimiento lento". Se puede dejar en blanco.

**Global del laboratorio** (no por especie):
- **Revisión semanal: cada miércoles.** El laboratorio revisa todos los cultivos ese día.
- **Recordatorio de revisión (NUEVO, 2026-09-03):** el tablero **marca un recordatorio** cuando toca la revisión semanal — un aviso visible arriba del panel el día de revisión (miércoles): *"Hoy es día de revisión — revisa tus cultivos"*. Sirve para acordarse de hacer la ronda, además de la alerta 🔵 "sin revisar" que señala lo que se quedó sin registrar.
  - *Decisión (2026-09-03):* se reemplazó el "recuérdame cada X días por especie" por este ajuste global (revisión + recordatorio del miércoles), porque refleja mejor cómo trabaja el laboratorio y es menos que llenar. Sin día de gracia por ahora. Más adelante se podrá permitir ritmos por especie, día de gracia o notificaciones fuera de la app (fuera de alcance v1).

## Reglas exactas de cada alerta (confirmadas con la usuaria)

Todas operan solo sobre especímenes en estado `activo`.

- 🔴 **Contaminación:** eventos con `meta.contaminacion` en (`confirmada`, `sospechosa`). Se agrupan por especie/tanda y método. Botón "Marcar contaminado" registra un evento de contaminación al momento.
- 🟡 **Germinación tardía:** el espécimen **aún no germina** (no existe evento/registro de germinación) **y** los días transcurridos desde la siembra (`especimenes.fecha_ingreso`) **superan** los "días esperados para germinar" de esa especie. Si la especie **no** tiene ese valor definido → NO alerta; se muestra "por definir".
- 🔵 **Sin revisar:** el último evento/registro del espécimen es **anterior al miércoles pasado** (el más reciente miércoles ya transcurrido). Si nunca se ha registrado nada desde la siembra, cuenta como sin revisar una vez pasado ese miércoles.
- 🗓️ **Recordatorio de revisión:** cuando el día actual es **miércoles**, el tablero muestra el aviso de "día de revisión" arriba de todo (es un recordatorio proactivo, no una alerta de problema).
- **Crecimiento lento** (dentro de la sección ③): la última altura registrada (`registros_evolucion.altura`) es **menor** que la "altura esperada" para su edad (cuando la edad del cultivo ≥ los "M días" definidos). Si no hay altura esperada → "por definir", sin alerta.

**Regla de oro:** todo sale de registros reales; si falta un valor esperado se muestra "por definir" en lugar de dar una falsa alarma.

## Fuentes de datos

- **`eventos`** (`especimen_id`):
  - `tipo = sanitizacion` → método de desinfección (usar `meta.protocolo_familia` / `meta.agentes` / `meta.protocolo`).
  - `tipo = observacion` (o contaminación) → `meta.contaminacion`, `meta.germinacion`, `meta.semillas_germinadas`, `meta.dia`, `meta.alcance_frascos`, `meta.confirmado`.
- **`registros_evolucion`** → altura y demás variables en el tiempo, por espécimen.
- **`especimenes`** → `especie_id`, `uid`, `estado`, `fecha_ingreso` (siembra).
- **`especies.ficha`** (JSONB existente) → guardar los valores esperados por especie bajo una nueva clave `estandar`, p. ej.:
  ```json
  "estandar": { "dias_germinar": 10, "altura_esperada": { "mm": 4, "dias": 30 } }
  ```
  Se usa `ficha` (columna JSONB ya existente) **para no requerir migración** (la usuaria no tiene permisos para migrar BD).
- **Revisión semanal (miércoles):** constante de configuración del backend en v1 (`DIA_REVISION_SEMANAL = "miercoles"`). Se podrá mover a una tabla de settings más adelante sin cambiar la interfaz.

## Arquitectura técnica

- **Backend**
  - `DiagnosticoService` (`backend/app/services/diagnostico_service.py`): agrega y normaliza los datos de las fuentes anteriores y aplica las reglas de alerta. Devuelve un payload listo para pintar.
  - Router `backend/app/routers/diagnostico.py`: `GET /diagnostico` (global, protegido por `auth.get_current_user`). Respuesta:
    ```json
    {
      "recordatorio_revision": { "activo": true, "mensaje": "Hoy es día de revisión — revisa tus cultivos" },
      "alertas": {
        "contaminacion": [ ... ],
        "germinacion_tardia": [ ... ],
        "sin_revisar": [ ... ]
      },
      "metodo_resultado": [
        { "metodo": "agua oxigenada 3%", "tandas_germinaron": N, "tandas_contaminadas": 0, "hallazgo": "..." }
      ],
      "germinacion_crecimiento": [
        { "especie": "...", "germinadas": N, "dias_germinar_prom": D, "altura_mm": H, "estado": "a_tiempo|lento|por_definir" }
      ]
    }
    ```
  - Guardar valores esperados por especie: reusar el endpoint de actualización de especie (PATCH sobre `ficha.estandar`) o un endpoint dedicado pequeño `PUT /especies/{id}/estandar`. Se elige el que menos código nuevo requiera al implementar.
  - "Marcar contaminado": reusar el alta de evento existente (`POST` de evento con `tipo` de contaminación y `meta.contaminacion = "confirmada"`).
  - Respetar **import-linter** (capas: router → service → repositorio/modelos; sin saltos).
- **Frontend**
  - Nueva página de inicio (tablero) como ruta principal al entrar (`/` o `/inicio`), componente React que consume `/api/diagnostico` vía `src/api/client.js`.
  - Estilos **inline** (`const s = { ... }`) y paleta verde oscuro del proyecto.
  - Banner de recordatorio de revisión arriba del panel cuando `recordatorio_revision.activo`.
  - Acción "Marcar contaminado" hace el POST y refresca el tablero.
  - Formulario simple por especie para capturar los valores esperados (en la ficha de la especie o un modal desde el tablero).

## Manejo de errores / casos sin datos

- Sin cultivos o sin eventos → cada sección muestra un mensaje amable ("aún no hay datos para mostrar"), nunca un error.
- Valores esperados no definidos → "por definir", sin alerta.
- Si el backend falla, la página muestra un aviso claro y un botón de reintento; no se rompe la navegación.

## Pruebas (BDD primero)

Escenarios Gherkin **antes** de implementar, corriendo **contra `lbms_test`** (nunca la BD viva — ver convención del proyecto). Escenarios mínimos:
- La contaminación confirmada/sospechosa aparece en 🔴.
- "Germinación tardía" salta solo si pasaron los días esperados **y** el valor está definido; no salta si está "por definir".
- "Sin revisar" salta cuando no hay registro desde el miércoles pasado.
- El **recordatorio de revisión** aparece en miércoles y no aparece los demás días.
- El cruce método↔resultado cuenta bien tandas germinadas vs contaminadas y arma el hallazgo.
- Degradación elegante cuando no hay datos.

## Conexiones

- Alimenta y se conecta con el futuro **ADR-0002** (diagnóstico / modelos mixtos).
- Usa la distinción de especies **Zinnia ≠ Gitana** (nunca mezclar) y los datos ya corregidos de contaminación (mostaza/cilantro = confirmada, todos los frascos; agua oxigenada = 0 contaminación).

## Notas de datos (contexto 2026-09-02/03)

- Especie renombrada: "Zinnia Gitana" → **"Gitana"** (Zinnia = *Zinnia elegans*; Gitana = *Zinnia elegans 'Gitana'*; nunca mezclar).
- **Mostaza y cilantro** (desinfección alcohol+clorox): contaminación **confirmada, todos los frascos** (verificado en BD 2026-09-03).
- **Pendiente (dato, no diseño):** confirmar en la etiqueta física si "Zinnia #5" y "#7" son Zinnia o Gitana; hoy están en `GITA-005/007` y podría ser incorrecto.
