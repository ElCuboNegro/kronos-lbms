# Panel de diagnóstico de mis cultivos — Diseño

**Fecha:** 2026-09-02
**Autor:** Juan José Alban / usuaria del laboratorio (con Claude Code)
**Estado:** EN PROGRESO (borrador) — Parte 1 aprobada; Parte 2 presentada y pendiente de aprobar; faltan secciones técnicas.

## Objetivo

Que al **entrar** a la plataforma, la científica vea de un vistazo **qué va bien y qué va mal con SUS propios cultivos**, para que **no se le pase ningún dato importante** (contaminación, algo que necesita atención). Es la segunda de las dos piezas "hacer la plataforma más científica / que me aporte" (la primera es *Artículos científicos por especie*, ver `2026-08-24-articulos-cientificos-por-especie-design.md`).

## Enfoque elegido

**Camino 1 — Tablero de inicio (APROBADO).** Una pantalla que se ve al entrar, con TODOS los cultivos de un vistazo. (Se descartó el Camino 2, "diagnóstico dentro de cada especie", porque no da la vista general y sí se podría pasar algo.)

## Contenido del panel (Parte 1 — APROBADA)

Tres secciones, en este orden (lo urgente primero):

**① Lo que necesita tu atención** (arriba del todo — para que nada se pase):
- 🔴 **Contaminación** — frascos/tandas contaminados o sospechosos, con acción **"Marcar contaminado"**.
- 🟡 **Germinación tardía / no germinó** — pasó el tiempo esperado y no germina.
- 🔵 **Sin revisar hace días** — frascos sin registro reciente.

**② ¿Qué método de desinfección funciona mejor?** — cruce **método ↔ resultado**: por cada método (p. ej. agua oxigenada 3% vs alcohol 70% + clorox 2%), cuántas tandas germinaron y cuántas se contaminaron. Muestra un **hallazgo** en lenguaje claro (ej.: "con tus datos, el agua oxigenada no dio contaminación; el alcohol+clorox contaminó todo"). Conecta con la hipótesis de desinfección del diseño factorial.

**③ Germinación y crecimiento (vs. lo que tú esperas)** — por cultivo: cuántas germinaron, días a germinar, altura, y estado comparado con lo esperado (a tiempo / lento / por definir).

Los números **siempre salen de los registros reales** (no se inventan). Si aún no hay valor esperado para una especie, se muestra "por definir".

## Herramienta "tiempos esperados por especie" (Parte 2 — PENDIENTE DE APROBAR)

Motivación de la usuaria: cada persona siembra especies distintas, así que lo "esperado" no puede estar fijo; debe ser **configurable por especie y reutilizable** para cualquier usuario. Elegido: **la usuaria define los valores** (no aprendizaje automático por ahora).

Campos propuestos por especie:
- **Días esperados para germinar** (dispara "germinación tardía").
- **Recordarme revisar cada X días** (dispara "sin revisar hace días").
- **Altura esperada (opcional): N mm a los M días** (dispara "crecimiento lento").

Falta que la usuaria confirme si lo deja completo o lo simplifica (solo "días para germinar").

## Pendientes de diseño (para la próxima sesión)

- Aprobar Parte 2 (campos de la herramienta de tiempos esperados).
- **Fuentes de datos:** `eventos` (tipo `sanitizacion` = método; `observacion`/`contaminacion` con `meta.contaminacion`, `meta.germinacion`, `meta.semillas_germinadas`) y `registros_evolucion` (altura, etc.). Valores esperados: guardarlos por especie (reusar `especies.ficha` o `config_estandar` JSONB).
- **Reglas exactas de cada alerta** (umbrales).
- **Arquitectura técnica:** service de diagnóstico (agrega/normaliza), endpoint `GET /diagnostico` (global), página React de inicio; acción "marcar contaminado" (POST evento de contaminación). Respetar import-linter y estilos inline.
- **Manejo de errores / casos sin datos.**
- **Pruebas (BDD primero)** contra `lbms_test`, según convención del proyecto.
- Conecta con el futuro **ADR-0002** (diagnóstico).

## Notas de datos corregidas en esta sesión (2026-09-02)

- Especie renombrada: "Zinnia Gitana" → **"Gitana"** (la usuaria distingue **Zinnia** = *Zinnia elegans* de **Gitana** = *Zinnia elegans 'Gitana'*; nunca mezclar).
- **Mostaza y cilantro** (desinfección alcohol+clorox): contaminación **confirmada, todos los frascos**.
- **Pendiente:** verificar en la etiqueta física si "Zinnia #5" y "#7" (reportados el 02-sep) son Zinnia o Gitana; hoy quedaron en `GITA-005/007` y podría ser incorrecto.
