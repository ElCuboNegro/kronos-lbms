# Diseño factorial — Cimientos (Plan 1 de 4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir definir factores, niveles y generar automáticamente los tratamientos (producto cartesiano) de un experimento en el LBMS.

**Architecture:** Modelo relacional dedicado (ADR-0001, Opción B). Nuevas tablas `factores_experimentales`, `niveles_factor`, `tratamientos` y la tabla de unión `tratamiento_nivel`, colgando del `Experimento` existente. La lógica de generación de tratamientos vive en el *service* (respeta import-linter). Todo es aditivo: no altera datos ni comportamiento de los experimentos actuales.

**Tech Stack:** Python 3 · FastAPI · SQLAlchemy · Alembic · PostgreSQL 16 · pytest (en Docker).

> **Decomposición del ADR-0001 en planes (este es el Plan 1):**
> 1. **Cimientos del diseño factorial** ← *este plan* — Factor, NivelFactor, Tratamiento + generación de tratamientos.
> 2. **Replicación y linaje** — UnidadExperimental, Submuestra, Subcultivo/Pase (INV-1, INV-3).
> 3. **Variables, plan de medición y observaciones** — VariableRespuesta, PlanMedicion, Observacion, tomas pendientes, tasas calculadas (INV-2).
> 4. **Cálculo de réplicas** — motor de poder estadístico (a priori / a posteriori).

> **Nota sobre migraciones:** los tests construyen el esquema desde los modelos (`Base.metadata.create_all` en `tests/conftest.py:21`), **no** desde Alembic. Por eso el código pasa los tests con solo agregar los modelos. La migración Alembic (Task 2) es el artefacto para el **despliegue**; el usuario final no la ejecuta (la aplica el flujo de despliegue o quien tenga acceso a la BD).

> **Runner de tests** (de `CLAUDE.md`). Para correr toda la suite:
> ```bash
> docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend \
>   sh -c "pip install -q pytest pytest-bdd httpx pytest-cov && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB} python -m pytest tests/ -v"
> ```
> Para correr **un solo test**, reemplaza `tests/` por la ruta completa, p. ej. `tests/test_diseno_factorial_regresion.py::test_crear_factor_con_niveles -v`.

---

### Task 1: Modelos — Factor, NivelFactor, Tratamiento, tratamiento_nivel

**Files:**
- Modify: `backend/app/models.py` (tabla de asociación tras línea 25; clases tras `class Experimento` que termina en :230; columnas/relaciones en `Experimento` 198-229)
- Test: `backend/tests/test_diseno_factorial_regresion.py` (crear)

- [ ] **Step 1: Write the failing test**

Crear `backend/tests/test_diseno_factorial_regresion.py`:

```python
"""Cimientos del diseño factorial (ADR-0001, Plan 1): modelos y relaciones."""
import pytest
from app import models


@pytest.fixture
def director(db):
    u = models.Usuario(nombre="Dir Test", email="dir-factorial@test.lab",
                       hashed_password="x", rol="admin")
    db.add(u)
    db.flush()
    return u


@pytest.fixture
def experimento(db, director):
    exp = models.Experimento(codigo="EXP-FACT-1", nombre="Ensayo factorial",
                             director_id=director.id, tipo_diseno="factorial")
    db.add(exp)
    db.flush()
    return exp


def test_factor_con_niveles(db, experimento):
    factor = models.Factor(experimento_id=experimento.id, nombre="auxina",
                           unidad="mg/L", tipo="continuo")
    factor.niveles.append(models.NivelFactor(etiqueta="0.5", valor_num=0.5, orden=1))
    factor.niveles.append(models.NivelFactor(etiqueta="1.0", valor_num=1.0, orden=2))
    db.add(factor)
    db.flush()

    assert factor.experimento.id == experimento.id
    assert len(factor.niveles) == 2
    assert factor.niveles[0].etiqueta == "0.5"


def test_tratamiento_referencia_niveles(db, experimento):
    factor = models.Factor(experimento_id=experimento.id, nombre="sustrato", tipo="categorico")
    nivel_a = models.NivelFactor(etiqueta="A", orden=1)
    factor.niveles.append(nivel_a)
    db.add(factor)
    db.flush()

    trat = models.Tratamiento(experimento_id=experimento.id, codigo="T1",
                              nombre="sustrato=A", es_control=False)
    trat.niveles.append(nivel_a)
    db.add(trat)
    db.flush()

    assert trat.experimento.id == experimento.id
    assert trat.niveles[0].etiqueta == "A"
    assert experimento.tratamientos[0].codigo == "T1"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `... python -m pytest tests/test_diseno_factorial_regresion.py -v` (con el runner de arriba)
Expected: FAIL con `AttributeError: module 'app.models' has no attribute 'Factor'`.

- [ ] **Step 3: Add the association table**

En `backend/app/models.py`, después de la tabla `experimento_elemento` (tras la línea 25):

```python
tratamiento_nivel = Table(
    "tratamiento_nivel", Base.metadata,
    Column("tratamiento_id", UUID(as_uuid=True), ForeignKey("tratamientos.id"), primary_key=True),
    Column("nivel_id", UUID(as_uuid=True), ForeignKey("niveles_factor.id"), primary_key=True),
)
```

- [ ] **Step 4: Add the three model classes**

En `backend/app/models.py`, inmediatamente después de `class Experimento` (después de la línea 230, antes de `class ResultadoInvestigacion`):

```python
class Factor(Base):
    __tablename__ = "factores_experimentales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experimento_id = Column(UUID(as_uuid=True), ForeignKey("experimentos.id"), nullable=False, index=True)
    nombre = Column(String(120), nullable=False)
    unidad = Column(String(40), nullable=True)
    tipo = Column(String(20), nullable=False, default="categorico")  # categorico | continuo
    descripcion = Column(Text, nullable=True)

    experimento = relationship("Experimento", back_populates="factores")
    niveles = relationship("NivelFactor", back_populates="factor",
                           cascade="all, delete-orphan", order_by="NivelFactor.orden")


class NivelFactor(Base):
    __tablename__ = "niveles_factor"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    factor_id = Column(UUID(as_uuid=True), ForeignKey("factores_experimentales.id"), nullable=False, index=True)
    etiqueta = Column(String(120), nullable=False)
    valor_num = Column(Float, nullable=True)
    orden = Column(Integer, nullable=False, default=0)

    factor = relationship("Factor", back_populates="niveles")


class Tratamiento(Base):
    __tablename__ = "tratamientos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experimento_id = Column(UUID(as_uuid=True), ForeignKey("experimentos.id"), nullable=False, index=True)
    codigo = Column(String(40), nullable=False)
    nombre = Column(String(255), nullable=True)
    es_control = Column(Boolean, nullable=False, default=False)
    descripcion = Column(Text, nullable=True)

    experimento = relationship("Experimento", back_populates="tratamientos")
    niveles = relationship("NivelFactor", secondary=tratamiento_nivel)
```

- [ ] **Step 5: Add column + relationships to Experimento**

En `class Experimento` (backend/app/models.py:198-229), añadir la columna tras `config_estandar` (línea 218):

```python
    tipo_diseno = Column(String(20), nullable=True, default="factorial")  # dca | factorial | bloques
```

Y junto a las demás relaciones del Experimento (tras la línea 229, `eventos = relationship(...)`):

```python
    factores = relationship("Factor", back_populates="experimento", cascade="all, delete-orphan")
    tratamientos = relationship("Tratamiento", back_populates="experimento", cascade="all, delete-orphan")
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `... python -m pytest tests/test_diseno_factorial_regresion.py -v`
Expected: PASS (2 passed).

- [ ] **Step 7: Verify architecture (import-linter) and commit**

```bash
cd backend && PYTHONPATH=. import-linter lint
git add backend/app/models.py backend/tests/test_diseno_factorial_regresion.py
git commit -m "feat(experimentos): modelos Factor, NivelFactor y Tratamiento (ADR-0001)"
```

---

### Task 2: Migración Alembic (artefacto de despliegue)

**Files:**
- Create: `backend/alembic/versions/a1b2c3d4e5f6_diseno_factorial.py`

> Esta migración NO la prueban los tests de pytest (usan `create_all`). Se valida aplicándola en local con Docker.

- [ ] **Step 1: Find the current head revision**

Run: `cd backend && PYTHONPATH=. alembic heads`
Anota el id que aparece (lo necesitas para `down_revision`). En este plan se asume `999999999999` (de `add_genealogy_indexes`); **usa el que devuelva el comando**.

- [ ] **Step 2: Create the migration file**

Crear `backend/alembic/versions/a1b2c3d4e5f6_diseno_factorial.py` (reemplaza `down_revision` por el head real del paso anterior):

```python
"""diseño factorial: factores, niveles, tratamientos

Revision ID: a1b2c3d4e5f6
Revises: 999999999999
Create Date: 2026-06-03 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '999999999999'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('experimentos', sa.Column('tipo_diseno', sa.String(length=20), nullable=True))

    op.create_table(
        'factores_experimentales',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('experimento_id', sa.UUID(), nullable=False),
        sa.Column('nombre', sa.String(length=120), nullable=False),
        sa.Column('unidad', sa.String(length=40), nullable=True),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['experimento_id'], ['experimentos.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_factores_experimentales_experimento_id'),
                    'factores_experimentales', ['experimento_id'], unique=False)

    op.create_table(
        'niveles_factor',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('factor_id', sa.UUID(), nullable=False),
        sa.Column('etiqueta', sa.String(length=120), nullable=False),
        sa.Column('valor_num', sa.Float(), nullable=True),
        sa.Column('orden', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['factor_id'], ['factores_experimentales.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_niveles_factor_factor_id'),
                    'niveles_factor', ['factor_id'], unique=False)

    op.create_table(
        'tratamientos',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('experimento_id', sa.UUID(), nullable=False),
        sa.Column('codigo', sa.String(length=40), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=True),
        sa.Column('es_control', sa.Boolean(), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['experimento_id'], ['experimentos.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_tratamientos_experimento_id'),
                    'tratamientos', ['experimento_id'], unique=False)

    op.create_table(
        'tratamiento_nivel',
        sa.Column('tratamiento_id', sa.UUID(), nullable=False),
        sa.Column('nivel_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['tratamiento_id'], ['tratamientos.id']),
        sa.ForeignKeyConstraint(['nivel_id'], ['niveles_factor.id']),
        sa.PrimaryKeyConstraint('tratamiento_id', 'nivel_id'),
    )


def downgrade() -> None:
    op.drop_table('tratamiento_nivel')
    op.drop_index(op.f('ix_tratamientos_experimento_id'), table_name='tratamientos')
    op.drop_table('tratamientos')
    op.drop_index(op.f('ix_niveles_factor_factor_id'), table_name='niveles_factor')
    op.drop_table('niveles_factor')
    op.drop_index(op.f('ix_factores_experimentales_experimento_id'), table_name='factores_experimentales')
    op.drop_table('factores_experimentales')
    op.drop_column('experimentos', 'tipo_diseno')
```

- [ ] **Step 3: Apply and roll back the migration locally (Docker)**

```bash
docker compose exec backend alembic upgrade head      # aplica
docker compose exec backend alembic downgrade -1      # revierte (prueba el downgrade)
docker compose exec backend alembic upgrade head      # vuelve a aplicar
```
Expected: cada comando termina sin error (`Running upgrade/downgrade ...`).

- [ ] **Step 4: Commit**

```bash
git add backend/alembic/versions/a1b2c3d4e5f6_diseno_factorial.py
git commit -m "feat(db): migración del diseño factorial (factores, niveles, tratamientos)"
```

---

### Task 3: Schemas Pydantic

**Files:**
- Modify: `backend/app/schemas.py` (añadir tras `class ExperimentoListItem`, línea 458+)

- [ ] **Step 1: Add the schemas**

En `backend/app/schemas.py`, tras `class ExperimentoListItem`:

```python
# ── Diseño factorial ──────────────────────────────────────────────────────────

class NivelFactorCreate(BaseModel):
    etiqueta: str
    valor_num: Optional[float] = None
    orden: int = 0


class NivelFactorOut(BaseModel):
    id: UUID
    etiqueta: str
    valor_num: Optional[float] = None
    orden: int
    model_config = {"from_attributes": True}


class FactorCreate(BaseModel):
    nombre: str
    unidad: Optional[str] = None
    tipo: str = "categorico"
    descripcion: Optional[str] = None
    niveles: list[NivelFactorCreate] = Field(default_factory=list)


class FactorOut(BaseModel):
    id: UUID
    nombre: str
    unidad: Optional[str] = None
    tipo: str
    descripcion: Optional[str] = None
    niveles: list[NivelFactorOut] = Field(default_factory=list)
    model_config = {"from_attributes": True}


class TratamientoOut(BaseModel):
    id: UUID
    codigo: str
    nombre: Optional[str] = None
    es_control: bool
    niveles: list[NivelFactorOut] = Field(default_factory=list)
    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Verify import (no test yet, just import sanity)**

Run: `... python -c "from app import schemas; print(schemas.FactorCreate, schemas.TratamientoOut)"`
Expected: imprime ambas clases sin error.

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas.py
git commit -m "feat(experimentos): schemas de Factor, NivelFactor y Tratamiento"
```

---

### Task 4: Service — generar_tratamientos (producto cartesiano)

**Files:**
- Modify: `backend/app/services/experiment_service.py`
- Test: `backend/tests/test_diseno_factorial_regresion.py` (añadir test)

- [ ] **Step 1: Write the failing test**

Añadir a `backend/tests/test_diseno_factorial_regresion.py`:

```python
from app.services.experiment_service import ExperimentService


def test_generar_tratamientos_producto_cartesiano(db, experimento):
    sustrato = models.Factor(experimento_id=experimento.id, nombre="sustrato", tipo="categorico")
    sustrato.niveles.append(models.NivelFactor(etiqueta="A", orden=1))
    sustrato.niveles.append(models.NivelFactor(etiqueta="B", orden=2))
    auxina = models.Factor(experimento_id=experimento.id, nombre="auxina", unidad="mg/L", tipo="continuo")
    auxina.niveles.append(models.NivelFactor(etiqueta="0.5", valor_num=0.5, orden=1))
    auxina.niveles.append(models.NivelFactor(etiqueta="1.0", valor_num=1.0, orden=2))
    db.add_all([sustrato, auxina])
    db.flush()

    tratamientos = ExperimentService.generar_tratamientos(db, experimento.id)

    # 2 niveles × 2 niveles = 4 tratamientos
    assert len(tratamientos) == 4
    # cada tratamiento referencia un nivel por factor (2 niveles)
    assert all(len(t.niveles) == 2 for t in tratamientos)
    codigos = {t.codigo for t in tratamientos}
    assert codigos == {"T1", "T2", "T3", "T4"}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `... python -m pytest tests/test_diseno_factorial_regresion.py::test_generar_tratamientos_producto_cartesiano -v`
Expected: FAIL con `AttributeError: type object 'ExperimentService' has no attribute 'generar_tratamientos'`.

- [ ] **Step 3: Implement the service method**

En `backend/app/services/experiment_service.py`: añadir `from itertools import product` al inicio del archivo (junto a los demás imports), y este método dentro de `class ExperimentService`:

```python
    @classmethod
    def generar_tratamientos(cls, db: Session, experimento_id) -> list:
        exp = db.query(models.Experimento).filter(
            models.Experimento.id == experimento_id).first()
        if not exp:
            raise HTTPException(status_code=404, detail="Experimento no encontrado")

        factores = db.query(models.Factor).filter(
            models.Factor.experimento_id == experimento_id).all()
        if not factores:
            raise HTTPException(status_code=400,
                                detail="El experimento no tiene factores definidos")

        niveles_por_factor = []
        for f in factores:
            if not f.niveles:
                raise HTTPException(status_code=400,
                                    detail=f"El factor '{f.nombre}' no tiene niveles")
            niveles_por_factor.append(list(f.niveles))

        creados = []
        for i, combo in enumerate(product(*niveles_por_factor), start=1):
            nombre = " · ".join(f"{n.factor.nombre}={n.etiqueta}" for n in combo)
            trat = models.Tratamiento(
                experimento_id=experimento_id, codigo=f"T{i}",
                nombre=nombre, es_control=False)
            trat.niveles = list(combo)
            db.add(trat)
            creados.append(trat)

        db.commit()
        for t in creados:
            db.refresh(t)
        return creados
```

- [ ] **Step 4: Run test to verify it passes**

Run: `... python -m pytest tests/test_diseno_factorial_regresion.py::test_generar_tratamientos_producto_cartesiano -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/experiment_service.py backend/tests/test_diseno_factorial_regresion.py
git commit -m "feat(experimentos): generar tratamientos por producto cartesiano de niveles"
```

---

### Task 5: Endpoints del router

**Files:**
- Modify: `backend/app/routers/experimentos.py` (añadir endpoints al final; ya está registrado en `main.py:59`)
- Test: `backend/tests/test_diseno_factorial_regresion.py` (añadir test de API)

- [ ] **Step 1: Write the failing API test**

Añadir a `backend/tests/test_diseno_factorial_regresion.py`:

```python
def test_api_crear_factor_y_generar_tratamientos(auth_client, db, experimento):
    eid = str(experimento.id)

    # crear dos factores con niveles vía API
    r1 = auth_client.post(f"/experimentos/{eid}/factores", json={
        "nombre": "sustrato", "tipo": "categorico",
        "niveles": [{"etiqueta": "A", "orden": 1}, {"etiqueta": "B", "orden": 2}],
    })
    assert r1.status_code == 201, r1.text
    assert len(r1.json()["niveles"]) == 2

    auth_client.post(f"/experimentos/{eid}/factores", json={
        "nombre": "auxina", "unidad": "mg/L", "tipo": "continuo",
        "niveles": [{"etiqueta": "0.5", "valor_num": 0.5, "orden": 1},
                    {"etiqueta": "1.0", "valor_num": 1.0, "orden": 2}],
    })

    # generar tratamientos
    r2 = auth_client.post(f"/experimentos/{eid}/tratamientos/generar")
    assert r2.status_code == 201, r2.text
    assert len(r2.json()) == 4

    # listarlos
    r3 = auth_client.get(f"/experimentos/{eid}/tratamientos")
    assert r3.status_code == 200
    assert len(r3.json()) == 4
```

- [ ] **Step 2: Run test to verify it fails**

Run: `... python -m pytest tests/test_diseno_factorial_regresion.py::test_api_crear_factor_y_generar_tratamientos -v`
Expected: FAIL con 404/405 (los endpoints aún no existen).

- [ ] **Step 3: Add the endpoints**

Al final de `backend/app/routers/experimentos.py`:

```python
# ── Diseño factorial ──────────────────────────────────────────────────────────

@router.post("/{experimento_id}/factores", response_model=schemas.FactorOut, status_code=201)
def crear_factor(experimento_id: UUID, payload: schemas.FactorCreate,
                 db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    exp = db.query(models.Experimento).filter(models.Experimento.id == experimento_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    factor = models.Factor(experimento_id=experimento_id, nombre=payload.nombre,
                           unidad=payload.unidad, tipo=payload.tipo, descripcion=payload.descripcion)
    for nv in payload.niveles:
        factor.niveles.append(models.NivelFactor(
            etiqueta=nv.etiqueta, valor_num=nv.valor_num, orden=nv.orden))
    db.add(factor)
    db.commit()
    db.refresh(factor)
    return factor


@router.get("/{experimento_id}/factores", response_model=list[schemas.FactorOut])
def listar_factores(experimento_id: UUID, db: Session = Depends(get_db),
                    _=Depends(auth.get_current_user)):
    return db.query(models.Factor).filter(models.Factor.experimento_id == experimento_id).all()


@router.post("/{experimento_id}/tratamientos/generar",
             response_model=list[schemas.TratamientoOut], status_code=201)
def generar_tratamientos(experimento_id: UUID, db: Session = Depends(get_db),
                         _=Depends(auth.get_current_user)):
    return ExperimentService.generar_tratamientos(db, experimento_id)


@router.get("/{experimento_id}/tratamientos", response_model=list[schemas.TratamientoOut])
def listar_tratamientos(experimento_id: UUID, db: Session = Depends(get_db),
                        _=Depends(auth.get_current_user)):
    return db.query(models.Tratamiento).filter(
        models.Tratamiento.experimento_id == experimento_id).all()
```

- [ ] **Step 4: Run the full test file to verify everything passes**

Run: `... python -m pytest tests/test_diseno_factorial_regresion.py -v`
Expected: PASS (5 passed: 2 de modelos + 1 de service + 1 de API + el fixture compartido).

- [ ] **Step 5: Run the FULL suite + architecture lint (no regressions)**

```bash
# suite completa (runner de arriba) — Expected: todo verde
# arquitectura:
cd backend && PYTHONPATH=. import-linter lint
```

- [ ] **Step 6: Commit**

```bash
git add backend/app/routers/experimentos.py backend/tests/test_diseno_factorial_regresion.py
git commit -m "feat(experimentos): endpoints de factores y generación de tratamientos"
```

---

## Self-Review

- **Spec coverage (Plan 1):** Factor/NivelFactor ✅ (Task 1,3,5), Tratamiento + join ✅ (Task 1,3), `tipo_diseno` en Experimento ✅ (Task 1,2), generación automática de tratamientos = producto cartesiano ✅ (Task 4,5), migración aditiva + reversible ✅ (Task 2), respeto a import-linter ✅ (Task 1,5). Fuera de alcance de este plan (Planes 2–4): unidad experimental, submuestra, subcultivo, variables de respuesta, plan de medición, observaciones, tasas, cálculo de réplicas e invariantes INV-1/2/3 (dependen de entidades de los planes siguientes).
- **Placeholders:** ninguno; todos los pasos llevan código y comando reales.
- **Consistencia de tipos:** `Factor.niveles` ↔ `NivelFactor.factor` (back_populates); `Tratamiento.niveles` vía `tratamiento_nivel`; nombres de tabla coinciden entre modelo (Task 1) y migración (Task 2); schemas (`FactorCreate/Out`, `NivelFactorCreate/Out`, `TratamientoOut`) usados igual en router y tests.

## Marca de control: el cálculo de réplicas y los invariantes NO están aquí

Este plan deja funcionando **factores → niveles → tratamientos**. La unidad experimental (que ancla los invariantes INV-1/2/3), las observaciones y el cálculo de réplicas llegan en los Planes 2–4. Es intencional: cada plan produce software funcional y probado por sí solo.
