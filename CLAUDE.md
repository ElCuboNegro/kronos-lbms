# LBMS — Laboratory Biological Management System

## Stack
- **Frontend:** React 18 + Vite + React Router DOM 6, served via Nginx on port 80
- **Backend:** Python FastAPI, port 8001 (proxied as `/api` by Nginx)
- **DB:** PostgreSQL 16 (Docker), SQLAlchemy ORM, Alembic para migraciones
- **HTTP Client (backend):** `httpx` (async)
- **Auth:** JWT Bearer tokens, `auth.get_current_user` dependency on all routes

## DB Migration Pattern
El proyecto usa Alembic. `create_all` está desactivado. Ver `agents.md` para el flujo completo.
```bash
docker compose exec backend alembic upgrade head   # aplicar migraciones pendientes
```

## Taxonomic Hierarchy
```
Especie  (species)
  └── Linea  (genetic line — propagation method)
       └── Variegacion  (variegation/variety)
            └── Especimen  (individual specimen)
```

## Specimen UID Format
`{SPECIES_CODE}-{YYMMDD}-{HHMMSS}-{INDEX:02d}`
Example: `MONS-260427-235932-01`

## Key Relationships
- **Experimento ↔ Especimen**: M2M via `experimento_especimen` table (with `rol` field: fuente/objetivo/control/testigo)
- **RegistroEvolucion**: linked to Especimen + optionally Protocolo (cloning context)
- **Protocolo ↔ Especie**: no direct FK; derive via Experimento or RegistroEvolucion

## Especie Model Fields
- `descripcion` (Text) — general/Wikipedia description
- `requerimientos` (JSONB) — optimal conditions: temperatura, humedad, luz, sustrato, ph, riego, notas
- `ficha` (JSONB) — biological profile: ciclo_vida, maduracion, notas_cultivo, wiki_url, wiki_lang, wiki_fetched_at

## Frontend API
All calls go through `src/api/client.js` → `api.get/post/patch(path, body)`
Base URL: `/api` (proxied to backend:8001)

## Key Pages
| Route | Component | Purpose |
|-------|-----------|---------|
| `/especies` | EspeciesList | List + search |
| `/especies/:id` | EspecieDetail | Tabs: Ficha (wiki+edit) / Líneas / Experimentos / Protocolos |
| `/especimenes?especie=&linea=` | EspecimenList | Filtered list |
| `/especimen/:id` | EspecimenDetail | Events, evolution records, photos |
| `/nuevo-individuo` | IndividuoCreate | Single specimen |
| `/nuevo-lote` | IndividuoMultiCreate | Bulk clone creation |

## Style Convention
All styles are inline JS objects in a `const s = { ... }` at bottom of each file.
Color palette: dark green background (#0f1f13, #1a2e1e), accent greens (#7dca8f, #4a8c5c, #2d7a47).

## Pre-commit Testing & Verification (MANDATORIO)
Antes de realizar cualquier `git commit`, es obligatorio verificar que toda la suite de tests pasa sin errores.

El proyecto utiliza `pre-commit` para automatizar validaciones (linting de arquitectura con `import-linter`, limpieza de espacios, etc.).
- Instalar hooks: `pre-commit install`
- Ejecutar manualmente: `pre-commit run --all-files`

### Ejecución de tests de backend:
Ejecuta la validación completa con:
```bash
docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest pytest-bdd httpx pytest-cov && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB} python -m pytest tests/ -v"
```

## Architecture Verification
El backend utiliza `import-linter` para asegurar que no haya violaciones de arquitectura (capas).
- Configuración: `backend/.importlinter`
- Comando: `cd backend && PYTHONPATH=. import-linter lint` (automatizado en pre-commit)

## Docker
```
docker compose up -d        # start all services
docker compose logs -f backend  # tail backend logs
```
Backend has hot-reload (volume mount of ./backend/app).
Frontend requires rebuild (`docker compose build frontend`) after code changes.

## Seymour OS MCP Server
El proyecto incluye un servidor MCP (`mcp/server.py`) que actúa como controlador universal para agentes de IA. Proporciona acceso directo a la base de datos (Especies, Inventario, Experimentos) y hardware (Impresora, Escáner).

### Configuración (Local)
Para conectar un agente a Seymour OS en desarrollo:
```json
"lbms_mcp": {
  "command": "python3",
  "args": ["/home/elcubonegro/lbms/mcp/server.py"],
  "env": {
    "LBMS_BASE_URL": "http://localhost:8001",
    "LBMS_EMAIL": "tu_usuario@kronos.lab",
    "LBMS_PASSWORD": "tu_password"
  }
}
```

### Configuración (Producción)
Para conectar a la base de datos real en la nube:
```json
"seymour_os_prod": {
  "command": "python3",
  "args": ["/home/elcubonegro/lbms/mcp/server.py"],
  "env": {
    "LBMS_BASE_URL": "https://lbms.kronosb.com/api",
    "LBMS_EMAIL": "tu_usuario@kronos.lab",
    "LBMS_PASSWORD": "tu_password"
  }
}
```

### Herramientas Destacadas
- `lbms_list_reactivos`: Consulta de inventario químico.
- `lbms_get_frontend_logs`: Trae los últimos crashes y errores reportados por las apps cliente (vía Telemetría).
- `lbms_imprimir_*`: Comandos directos de impresión física de etiquetas.
- `lbms_scan_qr`: Resolución instantánea de códigos de barras.

## Printer Service (GEZI Direct)
El servicio de impresión es un microservicio independiente (`printer_service/`) que corre en un contenedor privilegiado para acceder al USB. Proporciona una API normalizada para que cada entidad (Especimen, Reactivo, etc.) genere su etiqueta con el diseño correcto.

### Endpoints del Servicio de Impresión
- `POST /imprimir/especimen`: Etiqueta biológica (UID, Requerimientos).
- `POST /imprimir/reactivo`: Etiqueta química (Pictogramas, pureza).
- `POST /imprimir/sustrato`: Etiqueta de insumos (pH, EC).
- `POST /imprimir/lote`: Etiqueta de medio preparado (Receta escalada).
- `POST /imprimir/contenedor`: Etiqueta de inventario múltiple.
- `POST /imprimir-etiqueta-libre`: Flexibilidad total.
