# LBMS — Laboratory Biological Management System

## Stack
- **Frontend:** React 18 + Vite + React Router DOM 6, served via Nginx on port 80
- **Backend:** Python FastAPI, port 8001 (proxied as `/api` by Nginx)
- **DB:** PostgreSQL 16 (Docker), SQLAlchemy ORM, **no Alembic** — uses `create_all` at startup
- **HTTP Client (backend):** `httpx` (async)
- **Auth:** JWT Bearer tokens, `auth.get_current_user` dependency on all routes

## DB Migration Pattern
`create_all` only creates new tables, it does NOT add columns to existing tables.
For schema changes: write SQL in `backend/migrations/NNN_description.sql` and ask the user to run:
```
docker exec lbms-db-1 psql -U $POSTGRES_USER -d $POSTGRES_DB -f /path/to/migration.sql
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

## Docker
```
docker compose up -d        # start all services
docker compose logs -f backend  # tail backend logs
```
Backend has hot-reload (volume mount of ./backend/app).
Frontend requires rebuild (`docker compose build frontend`) after code changes.
