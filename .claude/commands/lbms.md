# Contexto LBMS

Estás trabajando en el proyecto **LBMS** (Laboratory Biological Management System) en `/home/elcubonegro/lbms`.

## Stack
- **Frontend**: React 18 + Vite (puerto 80 vía Nginx). Hot-reload activo.
- **Backend**: FastAPI Python (puerto 8001). Hot-reload activo (volumen Docker).
- **DB**: PostgreSQL 16 en Docker (`lbms-db-1`). Sin Alembic — usa `create_all`.
- **MCP**: `lbms_mcp` registrado en settings.json. Herramientas disponibles para operar la API directamente.

## Jerarquía taxonómica
```
Especie → Linea → Variegacion → Especimen
```

## Campos clave de Especie
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `descripcion` | Text | Descripción general (Wikipedia o manual) |
| `requerimientos` | JSONB | Condiciones: temperatura, humedad, luz, sustrato, ph, riego, notas |
| `ficha` | JSONB | Biología: ciclo_vida, maduracion, notas_cultivo, wiki_url, wiki_lang |

## Migraciones de DB
`create_all` solo crea tablas nuevas, NO añade columnas. Para cambios de esquema:
```sql
-- Ejecutar en: docker exec lbms-db-1 psql -U lbms -d lbms -c "..."
ALTER TABLE <tabla> ADD COLUMN IF NOT EXISTS <col> <tipo>;
```
Los archivos SQL van en `backend/migrations/`.

## Herramientas MCP disponibles
| Tool | Acción |
|------|--------|
| `lbms_list_especies` | Listar todas las especies (con búsqueda) |
| `lbms_get_especie` | Detalle de una especie (líneas, ficha, requerimientos) |
| `lbms_update_especie` | Actualizar ficha/descripción/condiciones |
| `lbms_buscar_wikipedia` | Obtener extracto de Wikipedia (sin guardar) |
| `lbms_get_especie_experimentos` | Experimentos con especímenes de esta especie |
| `lbms_get_especie_protocolos` | Protocolos aplicados a esta especie |
| `lbms_list_especimenes` | Listar especímenes (filtros: especie, línea, estado) |
| `lbms_get_especimen` | Detalle de un especimen (genealogía, eventos) |
| `lbms_list_experimentos` | Listar experimentos (filtro: estado) |
| `lbms_list_protocolos` | Listar protocolos (filtro: tipo) |

## Convención de estilos (frontend)
Todos los estilos son objetos inline JS en `const s = {}` al final de cada archivo JSX.
Paleta: oscuro verde (`#0f1f13`, `#1a2e1e`), acentos (`#7dca8f`, `#4a8c5c`, `#2d7a47`).

## Rutas del frontend
| Ruta | Componente |
|------|-----------|
| `/especies` | EspeciesList — catálogo |
| `/especies/:id` | EspecieDetail — tabs: Ficha / Líneas / Experimentos / Protocolos |
| `/especimenes` | Lista con filtros ?especie= &linea= &estado= |
| `/especimen/:id` | EspecimenDetail — eventos, evolución, fotos |
| `/nuevo-individuo` | IndividuoCreate |
| `/nuevo-lote` | IndividuoMultiCreate — clonación masiva |
