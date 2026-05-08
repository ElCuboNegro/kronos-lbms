# Roadmap de Modernización: LBMS

## Fase 1: Extracción del Dominio (Backend Refactoring)
- Crear Capa de Servicios (`backend/app/services/`).
- Mover lógica de `especimenes.py` a `SpecimenService`.
- Migrar calculadoras científicas del Frontend al Backend.

## Fase 2: Blindaje de Datos y Esquemas
- Modelos Pydantic para `config_estandar`.
- Saneamiento de la columna `indice`.

## Fase 3: Modernización de la Concurrencia
- Abstracción de bloqueos transaccionales.

## Fase 4: Evolución UX/UI
- Máquinas de estado para protocolos.

## Fase 5: Expansión AI
- Calculadoras como Tools de MCP.
