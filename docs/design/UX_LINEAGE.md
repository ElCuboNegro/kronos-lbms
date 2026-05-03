# Seymour OS UX Guidelines: Specimen Lineage & Explants

## Overview
La generación de explantes es el núcleo de la propagación in vitro. Mantener la relación Madre -> Hijo es crítico para la trazabilidad genética y el análisis de rendimiento de clones.

## Componentes Críticos

### 1. Botón de Propagación (`EspecimenDetail.jsx`)
- **Visual:** Un botón destacado en la pestaña "Info" con el ícono de propagación (ej. `🌱`).
- **Acción:** `navigate('/nuevo-individuo?madre=${esp.id}&especie=${esp.especie_id}')`.
- **UX:** El usuario no debería tener que buscar el ID de la planta madre si ya está dentro de su ficha.

### 2. Formulario de Creación Pre-poblado (`IndividuoCreate.jsx`)
- **Lógica:** Al recibir los parámetros `madre` y `especie`, el formulario debe bloquear o sugerir fuertemente esos campos.
- **Validación:** Si se genera un explante, el origen debería sugerir automáticamente "Explante In Vitro" o "Subcultivo".

## Flujo de Usuario (Scanner -> Detail -> Explant)
1. El usuario escanea el QR de un frasco (Planta Madre).
2. Seymour OS abre la ficha del espécimen.
3. El usuario decide propagar y pulsa "Generar Explante".
4. El formulario de creación aparece con el linaje ya establecido.
