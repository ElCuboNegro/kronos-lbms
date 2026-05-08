# Phase 4: Forensic Constitution - lbms

## Core Design Patterns
1. **Low-Level Consistency**: Transactional safety is prioritized at the database level (PG Advisory Locks).
2. **Flexible Schemas**: Use of JSONB columns (`config_estandar`) to avoid rigid tables for scientific parameters.
3. **AI-First Design**: Native integration with LLMs for unstructured data processing (Protocols).

## Technical Standards
- Mandatory use of UUIDs for all primary keys.
- Client-side heavy logic for non-persistent scientific tools.
