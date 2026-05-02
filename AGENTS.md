# LBMS — Guía de desarrollo para agentes

Este archivo complementa `CLAUDE.md` (stack, modelos, rutas). Aquí está el **cómo** trabajar en este proyecto: flujo git, reglas de testing, convenciones de código y trampas conocidas.

---

## Flujo de trabajo (Gitflow)

### Ramas permanentes
- `master` — producción. Solo recibe merges desde `develop` vía release, o hotfixes.
- `develop` — integración. Toda feature branch sale de aquí y vuelve aquí.

### Ciclo por issue

> **REGLA ESTRICTA:** Un solo issue por rama (Single Responsibility). Nunca mezcles múltiples fixes o features en una sola rama `feature/*` o `hotfix/*`. Si ves varios problemas, abre ramas separadas y PRs separados.

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/{número}-{slug-corto}
# Ejemplo: feature/25-fix-route-ordering-reactivos

# 2. Desarrollar: test primero, luego código (ver sección Testing)

# 3. PR a develop (nunca directo a master)
gh pr create --base develop --title "fix(#{n}): descripción" --body "Closes #{n} ..."

# 4. Merge squash o merge commit según tamaño
```

### Nombrado de ramas
| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Fix de bug | `feature/` | `feature/25-fix-route-ordering` |
| Nueva funcionalidad | `feature/` | `feature/15-experimento-resultados` |
| Hotfix urgente en producción | `hotfix/` | `hotfix/login-500` |
| Release | `release/` | `release/1.2.0` |

---

## Regla de testing (no negociable)

> **Todo código Python nuevo o modificado debe ir acompañado de sus tests en el mismo PR.**
> Un PR sin tests no está completo.

### Dónde van los tests

```
backend/tests/
├── conftest.py                        # fixtures globales (db, client, auth_client)
├── test_{router}_regresion.py         # tests de regresión por bug corregido
└── step_defs/
    └── test_{feature}.feature.py      # BDD para especificaciones de comportamiento
```

**Tests de regresión** (pytest plano): un bug corregido = un test que primero falla (red) y luego pasa (green) con el fix. Nombrar con el número de issue en el docstring.

**Tests BDD** (`step_defs/`): para especificaciones de negocio. Los `.feature` viven en `docs/features/`.

### Cómo correr los tests

```bash
# Desde la raíz del proyecto
docker compose run --rm \
  -v "$(pwd):/workspace" \
  --workdir /workspace/backend \
  --entrypoint "" \
  backend \
  sh -c "pip install -q pytest pytest-bdd httpx pytest-cov && \
         DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB} \
         python -m pytest tests/ -v --cov=app --cov-report=term-missing"
```

Para un solo archivo:
```bash
# reemplazar tests/ por tests/test_experimentos_regresion.py
```

### Verificación Pre-Commit (Regla Absoluta)
Todo agente o desarrollador DEBE ejecutar la suite de pruebas completa exitosamente antes de registrar un commit. No se permite realizar `git commit` a ciegas.

El proyecto utiliza `pre-commit`. Asegúrate de tenerlo instalado y configurado:
```bash
pre-commit install
```

Los hooks incluyen `import-linter` para verificar la arquitectura de capas en el backend.

### Estado actual del coverage (baseline)

| Router | % | Prioridad para mejorar |
|--------|---|------------------------|
| `printer.py` | 16% | baja (integración externa) |
| `evolucion.py` | 51% | alta |
| `scan.py` | 59% | alta |
| `protocolos.py` | 64% | media |
| `especimenes.py` | 67% | alta |
| `reactivos.py` | 69% | media |
| `especies.py` | 74% | media |
| `auth.py` | 68% | media |
| `experimentos.py` | 91% | ✓ |
| `models.py` | 100% | ✓ |
| `schemas.py` | 100% | ✓ |

---

## Coordinación Multi-Agente

Para acelerar el desarrollo, se permite la ejecución de múltiples agentes en paralelo bajo las siguientes reglas:

1. **Independencia de Tareas:** Cada agente debe trabajar en un issue diferente que no afecte a los mismos archivos simultáneamente.
2. **Delegación Estratégica:** El agente principal utilizará sub-agentes (`generalist`, `codebase_investigator`) para tareas de investigación o refactorización masiva, manteniendo el control de la integración.
3. **Gestión de Colisiones:**
   - No ejecutar dos agentes que modifiquen `models.py` o `schemas.py` al mismo tiempo (riesgo en migraciones de base de datos).
   - Las migraciones de Alembic deben generarse de forma secuencial para evitar conflictos en el historial de revisiones.
4. **Validación Cruzada:** Cada agente es responsable de correr los tests globales antes de dar por finalizada su tarea para asegurar que no hay regresiones causadas por la interacción de cambios paralelos.

---

## Convenciones de código Python

### Arquitectura y Capas (Import Linter)
El backend sigue una arquitectura de capas estricta definida en `backend/.importlinter`:
1. `app.routers`: Capa de entrada (API). Depende de todo lo de abajo.
2. `app.auth`: Seguridad. Depende de schemas, modelos y DB.
3. `app.schemas`: DTOs (Pydantic). Depende de modelos (opcionalmente) y DB.
4. `app.models`: Entidades (SQLAlchemy). Depende de la DB.
5. `app.database`: Configuración de conexión.

**Regla:** Ninguna capa inferior puede importar de una superior (ej. `models` no puede importar de `routers`).

### ORM: nombres de atributos en `Especimen`

El modelo tiene **dos** formas de acceder a la especie — no confundirlas:

```python
e.especie       # Column(String) — texto libre, siempre existe
e.especie_rel   # relationship("Especie") — puede ser None si especie_id es null
e.linea_rel     # relationship("Linea")    — ídem
e.variegacion_rel  # relationship("Variegacion") — ídem
```

Patrón correcto al serializar:
```python
especie=e.especie_rel.nombre_cientifico if e.especie_rel else e.especie,
linea_nombre=e.linea_rel.nombre if e.linea_rel else None,
```

### Orden de rutas en FastAPI

FastAPI evalúa rutas en orden de registro. Las rutas con segmentos **estáticos** deben declararse **antes** de las dinámicas `/{id}`:

```python
# ✓ CORRECTO
@router.get("/formulaciones", ...)   # estático primero
@router.get("/lotes", ...)           # estático primero
@router.get("/{id}", ...)            # dinámico al final

# ✗ INCORRECTO — "formulaciones" y "lotes" se interpretan como {id} → 422
@router.get("/{id}", ...)
@router.get("/formulaciones", ...)
@router.get("/lotes", ...)
```

### PATCH: `exclude_unset` vs `exclude_none`

```python
# ✓ CORRECTO — permite nullear campos enviando explícitamente null
payload.model_dump(exclude_unset=True)

# ✗ INCORRECTO — hace imposible quitar madre_id, linea_id, etc.
payload.model_dump(exclude_none=True)
```

### Campos opcionales en schemas

Si un campo en el modelo ORM es `nullable=True`, el schema Pydantic **debe** declararlo `Optional`:

```python
# models.py
codigo = Column(String(10), nullable=True)

# schemas.py — debe ser Optional
codigo: Optional[str] = None   # ✓
codigo: str                    # ✗ crash en serialización si hay nulls en DB
```

### Queries con relaciones: usar joinedload

Nunca dejar que SQLAlchemy lazy-load en endpoints que itere relaciones:

```python
# ✓ CORRECTO
db.query(models.Experimento).options(
    joinedload(models.Experimento.director),
    joinedload(models.Experimento.especimenes).joinedload(models.Especimen.linea_rel),
).filter(...).first()

# ✗ INCORRECTO — N+1 queries
exp = db.query(models.Experimento).filter(...).first()
for e in exp.especimenes:      # lazy load por cada espécimen
    print(e.linea_rel.nombre)  # lazy load adicional
```

---

## Migraciones de base de datos

El proyecto usa **Alembic**. `create_all` está desactivado en producción.

```bash
# Crear nueva migración tras cambiar models.py
docker compose exec backend alembic revision --autogenerate -m "descripcion_corta"

# Aplicar migraciones pendientes
docker compose exec backend alembic upgrade head

# Ver estado
docker compose exec backend alembic current
```

Los archivos de migración van en `backend/alembic/versions/`. Siempre revisar el autogenerado antes de aplicar — Alembic no detecta renombrados, solo drops+adds.

---

## Issues activos

El backlog completo está en https://github.com/ElCuboNegro/kronos-lbms/issues

Orden de implementación acordado:

| # | Tipo | Título corto | Estado |
|---|------|--------------|--------|
| [#5](https://github.com/ElCuboNegro/kronos-lbms/issues/5) | bug:crash | `_exp_out` atributos ORM incorrectos | ✅ PR #24 en develop |
| [#25](https://github.com/ElCuboNegro/kronos-lbms/issues/25) | bug:crash | Orden de rutas en `reactivos.py` | ✅ resuelto |
| [#6](https://github.com/ElCuboNegro/kronos-lbms/issues/6) | bug:crash | `EspecieListItem.codigo` no Optional | ✅ resuelto |
| [#7](https://github.com/ElCuboNegro/kronos-lbms/issues/7) | bug:data | PATCH `exclude_none` no nullea campos | 🔄 pendiente |
| [#13](https://github.com/ElCuboNegro/kronos-lbms/issues/13) | ux | CSS `--bio-*` vs `--theme-*` | 🔄 pendiente |
| [#12](https://github.com/ElCuboNegro/kronos-lbms/issues/12) | ux | `navigate(-1)` roto en deep links | 🔄 pendiente |
| [#9](https://github.com/ElCuboNegro/kronos-lbms/issues/9) | performance | Home carga todo para contar | 🔄 pendiente |
| [#10](https://github.com/ElCuboNegro/kronos-lbms/issues/10) | performance | N+1 en experimentos | 🔄 pendiente |
| [#15](https://github.com/ElCuboNegro/kronos-lbms/issues/15) | ux | ExperimentoDetail sin resultados | 🔄 pendiente |
| [#8](https://github.com/ElCuboNegro/kronos-lbms/issues/8) | security | CORS wildcard + credentials | 🔄 pendiente |
| [#16](https://github.com/ElCuboNegro/kronos-lbms/issues/16) | security | Sin rate limiting en login | 🔄 pendiente |
| [#17](https://github.com/ElCuboNegro/kronos-lbms/issues/17) | bug:data | Race condition en UIDs | 🔄 pendiente |
| [#20](https://github.com/ElCuboNegro/kronos-lbms/issues/20) | bug:data | Sin validación de rangos numéricos | 🔄 pendiente |
| [#21](https://github.com/ElCuboNegro/kronos-lbms/issues/21) | security | Subida de fotos sin validar extensión | 🔄 pendiente |
| [#14](https://github.com/ElCuboNegro/kronos-lbms/issues/14) | bug:data | `ExpConfigForm` pierde campos JSONB | 🔄 pendiente |
| [#18](https://github.com/ElCuboNegro/kronos-lbms/issues/18) | tech-debt | Sin paginación en listados | 🔄 pendiente |
| [#19](https://github.com/ElCuboNegro/kronos-lbms/issues/19) | tech-debt | `datetime.utcnow` deprecado | 🔄 pendiente |
| [#22](https://github.com/ElCuboNegro/kronos-lbms/issues/22) | tech-debt | Campo `Especimen.indice` sin usar | 🔄 pendiente |
| [#23](https://github.com/ElCuboNegro/kronos-lbms/issues/23) | ux | Errores de red indistinguibles de 404 | 🔄 pendiente |
| [#11](https://github.com/ElCuboNegro/kronos-lbms/issues/11) | performance | `crear_bulk` llama `_get_full` en loop | 🔄 pendiente |

---

## Checklist antes de abrir un PR

- [ ] La validación pre-commit (tests globales + hooks) fue ejecutada exitosamente justo antes de este PR.
- [ ] La arquitectura ha sido verificada con `import-linter`.
- [ ] La rama sale de `develop`, no de `master`
- [ ] El título del PR referencia el issue: `fix(#N): ...` o `feat(#N): ...`
- [ ] Todo código Python modificado tiene tests que pasan
- [ ] No se incluyen cambios no relacionados con el issue
- [ ] Si hay cambio de schema DB: migración Alembic incluida en el PR
