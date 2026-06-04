# ADR-0001 — Diseño formal del experimento en el LBMS

- **Estado:** Aceptado
- **Fecha:** 2026-06-03
- **Decisión:** Modelar el diseño experimental con un modelo relacional dedicado (Opción B)
- **Ámbito:** Cultivo in vitro de meristemos y callo (callogénesis)

---

## Contexto

El LBMS ya registra mucha información de laboratorio, pero el **diseño del experimento**
no está formalizado. Hoy el modelo `Experimento` tiene `hipotesis`, `protocolo`,
un campo libre `config_estandar` (JSONB) y especímenes asociados con un `rol`
(fuente/objetivo/control/testigo) a través de la tabla `experimento_especimen`.

Esto deja varios huecos para trabajar de forma científica:

- No hay forma estructurada de declarar **qué se manipula** (factores) ni sus **niveles**.
- No existen **tratamientos** explícitos como combinación de niveles.
- No se distingue la **réplica verdadera** de la **submuestra** (riesgo de pseudo-replicación).
- No se declaran las **variables de respuesta** que se medirán en cada experimento.
- No hay **plan de medición** (cada cuándo se mide qué) ni, por tanto, lista de tomas pendientes.
- No hay ninguna guía sobre el **número de réplicas** necesarias para confiar en el resultado.

El objetivo del usuario es que el LBMS sea "más científico": diseñar experimentos
correctamente, registrar observaciones de múltiples variables y, en fases posteriores,
**diagnosticar problemas** (contaminación endógena vs. del medio de cultivo) y
**generar informes/artículos con gráficas**. Esas dos últimas metas se documentarán
en sus propios ADR; este ADR sienta la base de datos sobre la que se construirán.

### Necesidades confirmadas con el usuario

1. **Multifactorial.** Se manipulan varios factores a la vez (ej. Sustrato A/B × Hormona 0.5/1.0 mg/L).
2. **Ambición:** documentar el diseño **+ plan de medición** con lista de tomas pendientes
   (no se requiere, por ahora, validación bloqueante).
3. **Generación automática de tratamientos** a partir de las combinaciones de niveles + control.
4. **Réplicas calculadas por el sistema:** sin umbrales fijos; el sistema calcula las réplicas
   necesarias por experimento, contando **réplicas verdaderas** (ver invariantes).
5. **Catálogo fijo de variables de respuesta** (no editable por el usuario final) propio de
   cultivo in vitro de meristemos y callo (ver Anexo A).
6. **Modelo de replicación correcto** (tres niveles) y **estructura longitudinal** para subcultivos.
7. **Aditivo:** los experimentos actuales deben seguir funcionando sin cambios.

---

## Causa raíz

Todas las carencias anteriores nacen de **una sola causa**: el LBMS guarda observaciones sueltas
pero **no representa la estructura del experimento** (factores, tratamientos, réplicas verdaderas y
tiempo). Este ADR ataca esa causa raíz dándole al sistema un **modelo explícito del diseño experimental**.

### Qué garantiza la estructura

Cada carencia queda resuelta de forma **estructural**, no por interpretación del analista:

1. **Distingue réplica de submuestra** — son entidades distintas y jerárquicamente subordinadas (INV-3).
2. **Calcula tasas con el *n* correcto** — el *n* de un tratamiento se computa contando **unidades
   experimentales**, nunca observaciones ni submuestras. Las tasas (% inducción, % contaminación) se
   evalúan **a nivel de unidad** y luego se **agregan** al tratamiento.
3. **Analiza la evolución longitudinal** — como cada observación lleva su **unidad experimental +
   número de pase**, los datos salen con la estructura que pide un **modelo mixto** (efecto aleatorio =
   unidad experimental).
4. **Diagnostica y grafica de forma fiable** — al **conocer el nivel de cada dato** (unidad / submuestra
   / grupo), el sistema puede agrupar, promediar submuestras y graficar **sin mezclar niveles por accidente**.

---

## Factores de decisión

- **Consultabilidad:** las fases futuras (diagnóstico, gráficas, artículo) necesitan consultar
  los datos por factor, por tratamiento y por variable. Es el factor de mayor peso.
- **Integridad:** asignar unidades experimentales a tratamientos y vincular niveles a factores requiere integridad referencial.
- **Corrección estadística:** el modelo debe impedir la pseudo-replicación (espacial y temporal).
- **Soporte multifactorial limpio.**
- **Esfuerzo de implementación** y respeto a los patrones existentes (FastAPI + SQLAlchemy + Alembic, capas validadas con import-linter).

---

## Opciones consideradas

### Opción A — Todo en JSONB (`config_estandar`)

Guardar el diseño completo como un documento JSON dentro del campo `config_estandar` que ya existe.

- 👍 Cero migración; implementación muy rápida; máxima flexibilidad de forma.
- 👎 No es consultable de forma sana; la asignación unidad→tratamiento pierde integridad.
- 👎 El diagnóstico y las gráficas futuras pagarían el costo de parsear JSON en cada consulta.

### Opción B — Modelo relacional dedicado  ✅ (elegida)

Tablas nuevas para factores, niveles, tratamientos, unidades experimentales, submuestras,
subcultivos, variables de respuesta, plan de medición y observaciones.

- 👍 Consultable con SQL: base sólida para diagnóstico y gráficas/artículo.
- 👍 Integridad referencial y separación física de los niveles (réplica vs. submuestra).
- 👍 Soporta multifactorial y estructura longitudinal de forma natural.
- 👎 Requiere migración Alembic y más código que A.

### Opción C — Híbrido

Tablas relacionales para lo que necesita integridad/consulta, pero factores/niveles en JSON.

- 👍 Menos tablas que B.
- 👎 Fronteras difusas; el análisis "por factor" se complica justo en lo que el usuario quiere después.

---

## Decisión

Se elige la **Opción B (modelo relacional dedicado)**.

Motivo principal: las siguientes fases serán **diagnóstico** y **gráficas/artículo**, y ambas dependen
de consultar los datos por factor, tratamiento y variable, **conociendo el nivel de cada dato**. JSONB (A)
ahorra trabajo hoy pero lo encarece justo donde más valor habrá después; el híbrido (C) no resuelve el
análisis por factor. B es la base correcta y todos los cambios son **aditivos**, sin romper lo existente.

---

## Modelo de replicación y unidad experimental

Se distinguen **tres niveles**:

| Nivel | Qué es | ¿Cuenta para el *n*? |
|---|---|---|
| **Réplica biológica** | Explantes de **distintas plantas madre** (variabilidad genética/fisiológica real) | ✅ Sí — idealmente repartidas entre madres |
| **Unidad experimental** (línea) | Cada frasco/tubo/placa **preparado, esterilizado y manejado por separado** | ✅ **Este es el *n* estadístico** |
| **Submuestra / repetición técnica** | Varios explantes del mismo frasco · subdivisiones del mismo callo · medir el mismo callo varias veces | ❌ **No** — se **promedian** a un valor por unidad |

### Invariantes estadísticos (reglas duras, inviolables)

- **INV-1 — El *n* siempre deriva de la unidad experimental.** Ninguna consulta debe contar
  observaciones (ni submuestras, ni mediciones, ni pases) como réplicas.
- **INV-2 — La varianza para potencia/diseño se toma ENTRE unidades del mismo tratamiento.** Las
  submuestras **solo se promedian** (a un valor por unidad) y **nunca** entran como variación independiente.
- **INV-3 — Réplica y submuestra son entidades distintas y jerárquicamente subordinadas**, no un campo:
  la submuestra está **anidada bajo** la unidad experimental como **subordinación estructural del modelo
  de datos**, no como algo que quede a interpretación del análisis.

### Pseudo-replicación que el modelo evita

- **Espacial:** contar varios explantes del mismo frasco como réplicas independientes.
- **Temporal:** contar varios pases de la misma línea como datos independientes.

Ignorar esto **subestima el error** y produce **falsos positivos** (diferencias "significativas" que no existen).

---

## Estructura longitudinal: subcultivos / pases

El subcultivo **no crea una réplica nueva**: convierte a la misma unidad en una serie en el tiempo.

```
Unidad experimental A  →  P0  →  P1  →  P2  →  P3 …   (UNA réplica verdadera)
Unidad experimental B  →  P0  →  P1  →  P2  →  P3 …   (otra réplica verdadera)
```

Cada observación se amarra a: **ID de la unidad** (persiste en todos los pases), **número de pase**
(P0, P1…) y **días desde la última transferencia**.

**Sublíneas anidadas:** si se divide un callo y cada mitad sigue su camino, son sublíneas que
**descienden** de la unidad madre (auto-referencia línea-padre → línea-hija). Si se transfiere entero,
sigue siendo una sola unidad medida en el tiempo.

> **Número de pase:** se rastrea como marca temporal del ciclo. No se le atribuyen efectos biológicos
> (el laboratorio no observa esa parte). El método de análisis (**modelos mixtos** con la unidad como
> efecto aleatorio; anidamiento para sublíneas) se define en el **ADR-0002**; este ADR solo garantiza
> que los datos se capturen con esa estructura.

---

## Diseño detallado

### Modelo de datos (entidades)

```
Experimento            + tipo_diseño (dca | factorial | bloques) + objetivo   [extiende lo existente]
  │
  ├── Factor           id, experimento_id, nombre, unidad, tipo(categorico|continuo)
  │     └── NivelDeFactor   id, factor_id, etiqueta, valor_num(nullable), orden
  │             ej.: factor "auxina" → niveles 0 / 0.5 / 1.0 mg·L⁻¹  (factoriales reales, no texto suelto)
  │
  ├── Tratamiento      id, experimento_id, codigo, nombre, es_control(bool)
  │     └── tratamiento_nivel (join)   tratamiento_id, nivel_id   # la combinación de niveles que se COMPARA
  │
  ├── VariableRespuesta   id, experimento_id, clave, etiqueta, unidad, tipo_dato, bloque,
  │                        nivel(por_unidad | tasa_grupo_calculada)
  ├── PlanMedicion     id, experimento_id, variable_respuesta_id,
  │                     cadencia_dias, dia_inicio, dia_fin, obligatoria(bool)
  │
  └── UnidadExperimental (línea)   ⭐ RÉPLICA VERDADERA — ancla del modelo (el n cuenta filas aquí, INV-1)
        │   id, experimento_id, tratamiento_id, planta_madre_id(auto-FK), unidad_padre_id(auto-FK)
        │
        ├── Submuestra            id, unidad_experimental_id, etiqueta
        │                          # subordinada POR DISEÑO = marca explícita de pseudorréplica (INV-3)
        │
        ├── Subcultivo/Pase       id, unidad_experimental_id, numero_pase, fecha_transferencia,
        │                          unidad_hija_id(nullable)   # genealogía línea-padre → línea-hija
        │
        └── Observacion           id, submuestra_id (o unidad_experimental_id), variable_respuesta_id,
                                   valor, timestamp, numero_pase, dias_desde_transferencia,
                                   es_replica_tecnica(bool)   # distingue medición original de repetición técnica
```

**Reglas de integridad:**

- Un tratamiento tiene **a lo más un nivel por factor**.
- No se puede borrar un nivel usado por algún tratamiento.
- Una unidad experimental pertenece a **un solo tratamiento** del **mismo experimento**.
- `PlanMedicion`: `cadencia_dias > 0` y `dia_fin >= dia_inicio`.

> **Relación con lo existente.** `Observacion` y `Subcultivo/Pase` se **solapan** con los actuales
> `RegistroEvolucion` (serie temporal de observaciones) y `Evento` (tipo "transferencia"). Este ADR
> define la **estructura canónica**; el mapeo/migración desde `RegistroEvolucion`/`Evento` y el papel de
> `Especimen` (¿unidad o submuestra?) se aterrizan en el **plan de implementación**, no aquí.

### Generación de tratamientos

A partir de los factores y sus niveles, el sistema **sugiere el producto cartesiano** de niveles como
tratamientos (4, 8, 12…), más un tratamiento marcado como control. El usuario puede ajustar (quitar
combinaciones no deseadas) antes de confirmar.

### Tasas: calculadas a nivel de unidad, luego agregadas

Las tasas (% contaminación, % supervivencia, % inducción de callo) **no se capturan a nivel grupo**: se
**calculan** a partir del estado **por unidad experimental**. El *n* del tratamiento se computa contando
**unidades experimentales, nunca observaciones ni submuestras** (INV-1).

> Ejemplo: `tasa_contaminacion(tratamiento) = (unidades contaminadas ÷ total de unidades) × 100`.

### Cálculo de réplicas (sin umbrales fijos)

El número de réplicas verdaderas por tratamiento se calcula por experimento mediante análisis de tamaño
de muestra / poder estadístico:

- **Cuenta sólo réplicas verdaderas** (unidades experimentales), **nunca** submuestras ni pases (INV-1).
- **Entradas:** poder objetivo (por defecto **80%**), significancia **α = 0.05** (configurables) y la
  **diferencia mínima a detectar**.
- **Variabilidad (INV-2):** se promedian las submuestras a un valor por unidad y se calcula la varianza
  **entre unidades** del mismo tratamiento. **Nunca** se usa la dispersión dentro de un frasco
  (subestimaría el error e inflaría los falsos positivos).
- **Origen del dato de variabilidad:** valor por defecto de literatura al inicio; se **refina con el
  historial** propio del laboratorio (misma especie), calculado siempre a nivel de unidad.
- **Variable que manda el *n*:** se calcula para **cada** variable seleccionada y se reporta la **más
  exigente** como *n* vinculante.

**Rol del cálculo: a priori vs. a posteriori.**

- *A priori (diseño):* es una **guía aproximada** para **orientar** el tamaño, no para precisarlo. Se
  compensa **redondeando el *n* hacia arriba**, **añadiendo margen**, con **análisis de sensibilidad** y
  un **enfoque secuencial / por etapas**.
- *A posteriori (con datos):* ya no se estima la varianza, **se mide** — el **error experimental del
  propio ensayo** es el dato válido. Para la **robustez se reportan intervalos de confianza del tamaño
  del efecto**, **no** un **análisis de potencia retrospectivo (post-hoc)** (circular y poco informativo).

El detalle de las fórmulas exactas y su validación se trata en la fase de implementación (plan).

### Variables de respuesta

Catálogo **fijo** (Anexo A) en cinco bloques. Cada variable declara su `tipo_dato` (porcentaje/tasa,
conteo, peso, categórica, días-hasta-evento, severidad) y su `nivel` (`por_unidad` o
`tasa_grupo_calculada`). El usuario **selecciona** qué variables medir por experimento (no inventa nuevas).

### Plan de medición y tomas pendientes

Para cada variable seleccionada se define una **cadencia** (cada cuántos días) y una ventana
(`dia_inicio`–`dia_fin`), **contadas desde el Día 0 = `Experimento.fecha_inicio`**; dentro de cada pase
se cuenta además "días desde la transferencia". Con eso, una consulta calcula la **lista de tomas
pendientes** por unidad y fecha. No bloquea ni obliga; sólo informa qué falta medir.

### Componentes afectados (capas existentes)

- **Modelos** (`backend/app/models.py`): entidades nuevas (Factor, NivelDeFactor, Tratamiento,
  UnidadExperimental, Submuestra, Subcultivo/Pase, VariableRespuesta, PlanMedicion, Observacion).
- **Migración** Alembic (revisión nueva); `create_all` permanece desactivado.
- **Schemas** (`backend/app/schemas.py`): entrada/salida Pydantic de cada entidad.
- **Servicio** (`backend/app/services/experiment_service.py`): generación de tratamientos (producto
  cartesiano), cálculo de réplicas (a nivel unidad), cálculo de tasas y de tomas pendientes. La lógica
  vive en el *service* (respeta import-linter).
- **Router** (`backend/app/routers/experimentos.py`): CRUD de las entidades y endpoint `GET .../tomas-pendientes`.

---

## Consecuencias

**Positivas**

- Base de datos consultable que habilita los ADR futuros de diagnóstico y de gráficas/artículo.
- Diseño multifactorial explícito (factores/niveles/tratamientos) con control bien definido.
- **Corrección estadística estructural:** distingue réplica de submuestra y evita la pseudo-replicación
  espacial y temporal; el *n* y la variabilidad se toman al nivel correcto (INV-1/2/3).
- Estructura longitudinal lista para modelos mixtos (ADR-0002).
- Cambios aditivos: los experimentos actuales siguen funcionando.

**Negativas / costos (resueltas)**

- *Aplicar la migración requiere acceso a la base de datos* (el usuario no tiene permisos para
  ejecutarla). **Resuelto:** el diseño se mantiene; la migración se **redacta** en la implementación y se
  **aplica por el flujo de despliegue** (o por quien tenga acceso), **no manualmente por el usuario**. En
  local corre vía Docker (`docker compose ... alembic upgrade head`). Todo es **aditivo y reversible**.
- *El cálculo de réplicas es aproximado a priori.* **Resuelto** por el **cambio de rol del cálculo**: a
  priori orienta (redondeo al alza, margen, sensibilidad, por etapas); a posteriori la inferencia usa el
  **error medido** y reporta **intervalos de confianza del tamaño del efecto**, no potencia retrospectiva.

**Riesgos y mitigaciones**

- *Catálogo fijo se queda corto:* se amplía en una revisión versionada (no es editable por el usuario
  final por diseño). Riesgo bajo.
- *Sobre-confianza en el número calculado:* el sistema muestra siempre los supuestos y la **confianza
  estimada** (nunca como certeza), y la conclusión final se basa en los intervalos de confianza del
  efecto medidos a posteriori.

---

## Trabajo futuro (otros ADR)

- **ADR-0002 — Diagnóstico y análisis estadístico:** inferir contaminación endógena vs. del medio (día
  de aparición y localización son las señales clave) y aplicar **modelos mixtos** (efecto aleatorio =
  unidad experimental; anidamiento para sublíneas) sobre la estructura longitudinal.
- **ADR-0003 — Informes y artículo científico con gráficas.**
- **ADR-0004 — Modelo de colorimetría** (si requiere más estructura que una variable categórica).

---

## Anexo A — Catálogo fijo de variables de respuesta (cultivo in vitro: meristemo + callo)

`nivel`: **U** = por unidad experimental · **G** = tasa de grupo (calculada a partir de las U).

### Bloque 1 — Asepsis / contaminación
| Clave | Etiqueta | Tipo | Nivel | Notas |
|---|---|---|---|---|
| contaminado | ¿Unidad contaminada? | booleano | U | base para la tasa |
| tasa_contaminacion | Tasa de contaminación | porcentaje | G | calculada |
| tipo_contaminante | Tipo de contaminante | categórica | U | fúngico/bacteriano/levadura/mixto |
| dia_aparicion_contaminacion | Día de aparición | dias-hasta-evento | U | temprana→medio/superficial; tardía→endógena |
| localizacion_contaminacion | Localización | categórica | U | medio/base del explante/sistémica |
| exudacion_fenolica | Exudación fenólica al medio | severidad (0–3) | U | oscurecimiento del medio |

### Bloque 2 — Viabilidad / estrés del explante
| Clave | Etiqueta | Tipo | Nivel | Notas |
|---|---|---|---|---|
| sobrevivio | ¿Unidad viva? | booleano | U | base para la tasa |
| tasa_supervivencia | Tasa de supervivencia | porcentaje | G | calculada |
| pardeamiento | Pardeamiento / oxidación | severidad (0–3) | U | fenolización |
| necrosis | Necrosis | porcentaje de tejido | U | |
| hiperhidricidad | Hiperhidricidad / vitrificación | booleano/% | U/G | problema clásico in vitro |

### Bloque 3 — Callo (callogénesis)
| Clave | Etiqueta | Tipo | Nivel | Notas |
|---|---|---|---|---|
| formo_callo | ¿Formó callo? | booleano | U | base para la tasa |
| tasa_induccion_callo | Tasa de inducción de callo | porcentaje | G | calculada |
| dias_inicio_callo | Días a inicio de formación | dias-hasta-evento | U | |
| peso_fresco_callo | Peso fresco del callo | peso (mg/g) | U | |
| peso_seco_callo | Peso seco del callo | peso (mg) | U | biomasa real |
| diametro_callo | Diámetro / volumen del callo | continua (mm/mm³) | U | |
| textura_callo | Textura | categórica | U | friable/compacto/nodular |
| color_callo | Color del callo | categórica/colorimetría | U | blanco/crema/amarillo/verde/marrón |
| indice_proliferacion | Índice de proliferación | razón | U | crecimiento entre subcultivos |

### Bloque 4 — Meristemo / organogénesis
| Clave | Etiqueta | Tipo | Nivel | Notas |
|---|---|---|---|---|
| establecido | ¿Meristemo establecido? | booleano | U | base para la tasa |
| tasa_establecimiento | Tasa de establecimiento | porcentaje | G | calculada |
| dias_brotacion | Días a brotación | dias-hasta-evento | U | |
| num_brotes | N.º de brotes por explante | conteo | U | tasa de multiplicación |
| longitud_brote | Longitud de brote | continua (mm) | U | |
| num_hojas | N.º de hojas | conteo | U | |
| pct_enraizamiento | % de enraizamiento | porcentaje | G | calculada |
| num_raices | N.º de raíces | conteo | U | |
| longitud_raiz | Longitud de raíz | continua (mm) | U | |
| num_embriones_somaticos | Embriones somáticos | conteo | U | si hay embriogénesis |

### Bloque 5 — Medio / ambiente (contexto; a veces son factores)
| Clave | Etiqueta | Tipo | Nivel | Notas |
|---|---|---|---|---|
| ph_medio | pH del medio (inicial/final) | continua | U | |
| conductividad_ec | Conductividad (EC) | continua | U | |
| consumo_medio | Consumo / desecación del medio | categórica/continua | U | |
| temperatura_c | Temperatura | continua (°C) | U | |
| fotoperiodo | Fotoperiodo | continua (h) | U | |
| intensidad_luminica | Intensidad lumínica | continua (lux) | U | |
