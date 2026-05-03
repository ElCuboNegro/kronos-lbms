# LBMS UX Guidelines: Run Mode (Focus Mode)

## Overview
El "Run Mode" es el entorno de ejecución de experimentos. Está diseñado para ser utilizado en el poyo del laboratorio, donde el usuario tiene guantes, la pantalla debe ser legible desde lejos, y el dispositivo no debe apagarse.

## Componentes Críticos

### 1. `StepAccordion` (Acordeón de Pasos)
- **Regla Visual:** Solo un paso debe estar visualmente activo/expandido a la vez para reducir la carga cognitiva.
- **Interacción:** El título del paso funciona como *toggle*.
- **Iconografía:** Usar iconos semánticos (🧪 para preparación, ⚗️ para mezcla, ⏱️ para incubación).

### 2. `ConcurrentTimerRow` (Fila de Temporizador)
- **Áreas Táctiles:** Los botones de "Play/Pause" (``, ``) deben medir al menos `44px x 44px` (Tailwind: `w-11 h-11`) para asegurar precisión con guantes.
- **Tipografía:** Usar fuentes monoespaciadas y en negrita (`font-mono text-xl font-bold`) para la cuenta regresiva, evitando saltos visuales al cambiar de dígito.
- **Color Coding:**
  - Detenido: Texto en gris/negro.
  - Corriendo: Borde pulsante o color de acento (ej. `text-blue-600`).
  - Finalizado: Texto en rojo de alerta (`text-red-500`) y vibración.

### 3. Master Controls (Controles Maestros)
- **Botón "Iniciar todos los temporizadores":** Debe estar por encima de la lista de temporizadores individuales. Es una acción de alto impacto (`btn-secondary` ancho completo).

### 4. Resiliencia de UX (Wakelock & Backgrounding)
- **Wakelock:** Al presionar cualquier botón de "Play", la app debe solicitar la API de Capacitor `KeepAwake` para evitar el bloqueo de pantalla.
- **Time-Drift Protection:** Los temporizadores de React **no** deben depender de `setInterval` sumando/restando segundos. Deben calcular el Delta (`Date.now() - endTime`). Así, si el móvil corta los recursos de JS al minimizar la PWA, el reloj volverá a mostrar la hora correcta instantáneamente al hacer *resume*.
