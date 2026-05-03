# LBMS UX Guidelines: Plate Map Annotation

## Overview
El "Plate Map" permite a los científicos trazar el esquema de una placa de microtitulación (ej. 24, 48, 96 pozos) y asociar físicamente las muestras del LBMS a posiciones específicas (ej. A1, C12).

## Componentes Críticos

### 1. `PlateGrid` (La Cuadrícula)
- **Responsive & Aspect Ratio:** La cuadrícula debe mantener la proporción espacial real de una placa física. Usaremos CSS Grid (`grid-cols-13` para dar espacio a la cabecera de filas).
- **Legibilidad:** Las cabeceras de columnas (1-12) y filas (A-H) deben estar siempre visibles. Si la pantalla es pequeña, la cuadrícula debe permitir desplazamiento bidireccional (Scroll horizontal/vertical) sin perder las cabeceras (Sticky headers).
- **Feedback Táctil:** Al tocar un pozo, este debe mostrar un anillo de selección fuerte (`ring-4 ring-blue-500`).

### 2. `WellEditorSheet` (El Panel de Edición Inferior)
- **No Modales:** Para mantener el contexto de la placa visible, la edición ocurre en un *Bottom Sheet* o panel inferior anclado (`fixed bottom-0`).
- **Batch Editing:** Si el usuario selecciona múltiples pozos, el título del panel cambia a "Editando N pozos". Cualquier cambio aplicado (Color, Vinculación de Espécimen) se aplica a **todos** los pozos seleccionados en lote.
- **Paleta de Colores (Semantic Colors):** Ofrecer una paleta predefinida (Rojo, Azul, Verde, Naranja, Púrpura) en forma de "Swatches" (círculos tocables grandes) para clasificar rápidamente réplicas biológicas o condiciones (ej. Tratamiento vs. Control).

### 3. Integración LBMS (Vinculación de Especímenes)
- **Autocompletado:** El campo de "Título" o "Espécimen" en el editor debe funcionar idealmente como un buscador rápido (Typeahead) que apunte al endpoint `/api/especimenes` del backend FastAPI, permitiendo traer el ID real en lugar de solo texto plano.
