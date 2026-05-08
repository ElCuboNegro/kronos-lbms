# Phase 3: BDD Specification (Massive Granularity Result)

## 1. QR & Barcode Resolution (scan.py)
**Scenario: Resolve by UUID**
- **Given** a raw UUID string
- **When** scanned via the universal resolver
- **Then** the system must identify the entity type and return its full state.
- **Proof:** `scan.py:L15-30`.

**Scenario: Fallback to Natural ID / UID**
- **Given** a barcode with a specific prefix (e.g., "REAC-")
- **When** scanned
- **Then** the system performs a lookup in the corresponding table (Reactivos).
- **Proof:** `scan.py:L45-60`.

## 2. Botanical Genealogy & Concurrency (especimenes.py)
**Scenario: Parent Validation on Registration**
- **Given** a new specimen registration
- **When** `madre_id` or `padre_id` are provided
- **Then** the system must verify their existence and link the lineage.
- **Proof:** `especimenes.py:L300-305`.

**Scenario: Atomic Index Generation**
- **Given** high-concurrency registration (bulk)
- **When** calculating the daily index (`YYMMDD-XXX`)
- **Then** the system uses a PostgreSQL advisory lock (`pg_advisory_xact_lock`) to prevent duplicates.
- **Proof:** `especimenes.py:L103`.

## 3. Hierarchical Configuration (Especies/Líneas)
**Scenario: Config Merging Strategy**
- **Given** a species with a 'config_estandar'
- **And** a genetic line that overrides specific keys
- **When** an individual is created or viewed
- **Then** the line's config takes precedence over the species'.
- **Proof:** `especies.py` and `printer.py` logic for label generation.

## 4. Lab Calculations (Calculators.jsx)
**Scenario: Cell Viability Tally**
- **Given** a total count of cells and a count of dead/stained cells
- **When** processed by the viability tool
- **Then** it returns the percentage of live cells using: `(1 - (dead/total)) * 100`.
- **Proof:** `frontend/src/pages/Calculators.jsx:L220`.

## 5. AI Protocol Ingestion (protocolos.py)
**Scenario: Automated Step Extraction**
- **Given** a physical protocol document (photo/scan)
- **When** uploaded to the system
- **Then** it uses Google GenAI to extract steps, durations, and requirements.
- **Proof:** `protocolos.py:L25-40`.
