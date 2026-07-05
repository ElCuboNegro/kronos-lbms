# Metodología de diseño experimental (universal)

Marco general de Diseño de Experimentos (DOE) para construir **cualquier** LBMS.
Es independiente del dominio (no solo biológico) y de la plataforma (software, base
de datos o tecnología). Si un sistema soporta los 10 pasos, el experimento será
analizable; si falla en uno, no.

## Secuencia de diseño

### Paso 1 — Objetivo e hipótesis
Definir la pregunta concreta y la respuesta de interés *antes* de tocar nada. Sin
pregunta clara no hay diseño, solo recolección de datos.
- **Plataforma:** registrar objetivo, hipótesis y respuesta esperada como parte del experimento.

### Paso 2 — Unidad experimental (la réplica verdadera)
Declarar qué entidad recibe un tratamiento de forma independiente. Distinguirla de la
**unidad de observación** (las mediciones que comparten una misma unidad son
submuestras, no réplicas). La variabilidad para dimensionar sale del nivel *entre unidades*.
- **Plataforma:** identidad propia por unidad, y vínculo unidad↔observación.

### Paso 3 — Factores y niveles
Especificar las variables que se manipulan deliberadamente (factores) y los valores que
toman (niveles). Con dos o más factores, contemplar arreglos **factoriales** para estimar
**interacciones**, no solo efectos principales.
- **Plataforma:** distinguir factor de nivel; permitir combinaciones.

### Paso 4 — Variables respuesta
Listar lo que se mide como resultado, marcando **una principal** (sobre la que se
dimensiona) y las secundarias, cada una con tipo, unidad y método de medición.
- **Plataforma:** variables tipadas, con unidad, método y jerarquía principal/secundaria.

### Paso 5 — Covariables y factores de ruido (bloqueo)
Reconocer las fuentes de variación que no interesan pero afectan el resultado (lote,
tiempo, operador, equipo, posición…). Lo que no se mantenga constante se **bloquea** o
se mide como **covariable**.
- **Plataforma:** capturar estos factores aunque no sean el objeto del estudio.

### Paso 6 — Aleatorización
Asignar tratamientos a unidades al azar, y aleatorizar también el orden y la ubicación de
ejecución. Esto evita que un efecto ajeno se confunda con el del tratamiento.
- **Plataforma:** registrar (e idealmente generar) la asignación aleatoria.

### Paso 7 — Tipo de diseño
Elegir la estructura según factores y bloqueo: completamente aleatorizado, bloques
completos al azar, factorial, parcelas divididas, etc. El tipo de diseño determina cómo
se analizará.
- **Plataforma:** representar la estructura del diseño, no solo una lista plana de tratamientos.

### Paso 8 — Tamaño de muestra (número de réplicas)
- *A priori:* solo **orienta**. Redondeo al alza, margen de pérdida, análisis de sensibilidad.
- *A posteriori:* usar el **error medido** y reportar **intervalos de confianza del tamaño
  del efecto**. Nunca potencia retrospectiva.
- **Plataforma:** almacenar tamaños y varianza observada para recalcular.

### Paso 9 — Estructura longitudinal (medidas repetidas)
Una observación repetida en el tiempo sobre la misma unidad **no es una réplica nueva**:
es una medida repetida de la misma entidad. Tratarla como independiente es
pseudo-replicación.
- **Plataforma:** vincular cada medición a su unidad + marca temporal/etapa.

### Paso 10 — Alcance, supuestos y plan de análisis
Declarar por adelantado qué se modela y qué **no**, a qué factores **no** se les atribuirá
efecto, y cuál será el análisis estadístico. Definir el análisis *antes* de ver los datos
evita decisiones a conveniencia.
- **Plataforma:** documentar alcance, supuestos y plan de análisis como parte del diseño.

## Resumen

| Paso | Decisión de diseño | Qué fija | Requisito de plataforma |
|------|--------------------|----------|--------------------------|
| 1 | Objetivo e hipótesis | Para qué se experimenta | Registrar pregunta y respuesta esperada |
| 2 | Unidad experimental | Qué es una réplica | Identidad por unidad; unidad↔observación |
| 3 | Factores y niveles | Qué se manipula | Factor ≠ nivel; factorial |
| 4 | Variables respuesta | Qué se mide | Tipadas, con unidad y jerarquía |
| 5 | Covariables / ruido | Qué se controla | Capturar factores ajenos |
| 6 | Aleatorización | Cómo se asigna y ordena | Registrar/generar el azar |
| 7 | Tipo de diseño | Qué estructura tiene | Representar la estructura del diseño |
| 8 | Tamaño de muestra | Cuántas unidades | A priori orienta; a posteriori IC del efecto |
| 9 | Medidas repetidas | Si el tiempo es réplica | Medición ligada a unidad + tiempo |
| 10 | Alcance y análisis | Qué NO se modela y cómo se analiza | Documentar alcance, supuestos y plan |
