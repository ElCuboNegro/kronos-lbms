# Panel de Diagnóstico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un tablero de inicio que, al entrar a la plataforma, muestre qué va bien/mal con los cultivos: alertas (contaminación, germinación tardía, sin revisar), recordatorio semanal de revisión (miércoles), cruce método↔resultado de desinfección, y germinación/crecimiento vs. lo esperado por especie.

**Architecture:** Backend `DiagnosticoService` (funciones puras + agregación desde `eventos`, `registros_evolucion`, `especimenes`) expuesto por `GET /diagnostico`. Los valores esperados por especie se guardan en la columna JSONB existente `especies.config_estandar["diagnostico"]` (SIN migración) y se editan con el `PATCH /especies/{id}` ya existente. Frontend: `Home.jsx` (ruta `/`) consume `/api/diagnostico` y pinta el tablero; acción "Marcar contaminado" reusa `POST /eventos`.

**Tech Stack:** FastAPI + SQLAlchemy + PostgreSQL (backend), pytest + pytest-bdd (tests, contra `lbms_test`), React 18 + Vite + estilos inline (frontend).

**Convenciones del proyecto (obligatorias):**
- Tests SIEMPRE contra `lbms_test`, nunca la BD viva (los tests commitean de verdad). Ver `docs/superpowers/specs/2026-09-02-panel-diagnostico-design.md`.
- Respetar `import-linter` (capas: router → service → models; sin saltos).
- Frontend: estilos inline `const s = {...}`, paleta verde oscuro (#0f1f13, #1a2e1e, #7dca8f, #4a8c5c, #2d7a47), llamadas vía `src/api/client.js`.
- Especies **Zinnia ≠ Gitana**: nunca mezclar (regla de datos, no de código).

**Contrato del payload `GET /diagnostico`:**
```json
{
  "recordatorio_revision": { "activo": true, "mensaje": "Hoy es día de revisión — revisa tus cultivos" },
  "alertas": {
    "contaminacion":     [ { "especimen_id": "...", "uid": "...", "especie": "...", "estado": "confirmada|sospechosa" } ],
    "germinacion_tardia":[ { "especimen_id": "...", "uid": "...", "especie": "...", "dias": 25, "esperado": 21 } ],
    "sin_revisar":       [ { "especimen_id": "...", "uid": "...", "especie": "...", "dias_sin_registro": 12 } ]
  },
  "metodo_resultado": [
    { "metodo": "agua oxigenada 3%", "tandas": 5, "germinaron": 5, "contaminadas": 0, "hallazgo": "con tus datos, agua oxigenada 3% no dio contaminación." }
  ],
  "germinacion_crecimiento": [
    { "especie": "Gitana", "germinadas": 5, "total": 7, "altura_mm": 4.0, "estado_crecimiento": "a_tiempo|lento|por_definir" }
  ]
}
```

**Dónde se guardan los valores esperados (por especie):**
```json
// especies.config_estandar
{ "diagnostico": { "dias_germinar": 21, "altura_esperada_mm": 4, "altura_esperada_dias": 30 } }
```
`dias_germinar` default sugerido 21 (3 semanas, in vitro); altura opcional (puede faltar).

---

## Task 1: Escenarios BDD (BDD primero)

Escribimos primero los escenarios que describen el comportamiento del tablero. Aún sin implementación; se conectan en la Task 9.

**Files:**
- Create: `docs/features/panel_diagnostico.feature`

- [ ] **Step 1: Escribir el feature file**

```gherkin
# language: es
Característica: Panel de diagnóstico de mis cultivos
  Como científica del laboratorio
  Quiero ver al entrar qué va bien y qué va mal con mis cultivos
  Para no pasar por alto contaminación ni revisiones pendientes

  Antecedentes:
    Dado que estoy autenticada en el LBMS

  Escenario: La contaminación confirmada aparece como alerta
    Dado un espécimen activo con un evento de contaminación "confirmada"
    Cuando pido el diagnóstico
    Entonces la alerta de contaminación incluye ese espécimen

  Escenario: Germinación tardía solo cuando hay valor esperado y se superó
    Dado una especie con "dias_germinar" esperado de 21
    Y un espécimen de esa especie sembrado hace 25 días sin germinar
    Cuando pido el diagnóstico
    Entonces la alerta de germinación tardía incluye ese espécimen

  Escenario: Sin valor esperado no hay falsa alarma de germinación
    Dado una especie sin "dias_germinar" definido
    Y un espécimen de esa especie sembrado hace 60 días sin germinar
    Cuando pido el diagnóstico
    Entonces la alerta de germinación tardía no incluye ese espécimen

  Escenario: El recordatorio de revisión aparece los miércoles
    Cuando pido el diagnóstico un miércoles
    Entonces el recordatorio de revisión está activo

  Escenario: El recordatorio de revisión no aparece otros días
    Cuando pido el diagnóstico un jueves
    Entonces el recordatorio de revisión no está activo
```

- [ ] **Step 2: Commit**

```bash
git add docs/features/panel_diagnostico.feature
git commit -m "test(diagnostico): escenarios BDD del panel de diagnóstico"
```

---

## Task 2: Helpers de revisión semanal (funciones puras)

**Files:**
- Create: `backend/app/services/diagnostico_service.py`
- Test: `backend/tests/test_diagnostico_service.py`

- [ ] **Step 1: Escribir los tests que fallan**

```python
# backend/tests/test_diagnostico_service.py
from datetime import date
from app.services.diagnostico_service import DiagnosticoService as DS


class TestRevisionSemanal:
    def test_miercoles_es_dia_de_revision(self):
        # 2026-09-02 es miércoles
        assert DS.es_dia_revision(date(2026, 9, 2)) is True

    def test_jueves_no_es_dia_de_revision(self):
        assert DS.es_dia_revision(date(2026, 9, 3)) is False

    def test_ultimo_miercoles_desde_un_lunes(self):
        # lunes 2026-08-31 -> miércoles anterior 2026-08-26
        assert DS.ultimo_miercoles(date(2026, 8, 31)) == date(2026, 8, 26)

    def test_ultimo_miercoles_en_miercoles_devuelve_el_de_la_semana_previa(self):
        # miércoles 2026-09-02 -> 2026-08-26 (estrictamente anterior)
        assert DS.ultimo_miercoles(date(2026, 9, 2)) == date(2026, 8, 26)
```

- [ ] **Step 2: Correr y ver que falla**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_service.py::TestRevisionSemanal -v"`
Expected: FAIL con `ModuleNotFoundError: No module named 'app.services.diagnostico_service'`

- [ ] **Step 3: Implementación mínima**

```python
# backend/app/services/diagnostico_service.py
from datetime import date, timedelta

MIERCOLES = 2  # date.weekday(): lunes=0 ... domingo=6
MENSAJE_REVISION = "Hoy es día de revisión — revisa tus cultivos"


class DiagnosticoService:
    @staticmethod
    def es_dia_revision(hoy: date) -> bool:
        return hoy.weekday() == MIERCOLES

    @staticmethod
    def ultimo_miercoles(hoy: date) -> date:
        """El miércoles más reciente ESTRICTAMENTE anterior a hoy."""
        dias = (hoy.weekday() - MIERCOLES) % 7
        if dias == 0:
            dias = 7
        return hoy - timedelta(days=dias)
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_service.py::TestRevisionSemanal -v"`
Expected: PASS (4 passed)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/diagnostico_service.py backend/tests/test_diagnostico_service.py
git commit -m "feat(diagnostico): helpers de revisión semanal (miércoles)"
```

---

## Task 3: Evaluadores puros de germinación tardía y crecimiento

**Files:**
- Modify: `backend/app/services/diagnostico_service.py`
- Test: `backend/tests/test_diagnostico_service.py`

- [ ] **Step 1: Escribir los tests que fallan**

```python
# backend/tests/test_diagnostico_service.py  (añadir al final)
class TestEvaluadores:
    def test_germinacion_tardia_cuando_supera_lo_esperado(self):
        assert DS.germinacion_tardia(
            fecha_ingreso=date(2026, 8, 1), dias_germinar=21,
            germinado=False, hoy=date(2026, 8, 26)) is True

    def test_no_es_tardia_si_aun_dentro_del_plazo(self):
        assert DS.germinacion_tardia(
            fecha_ingreso=date(2026, 8, 20), dias_germinar=21,
            germinado=False, hoy=date(2026, 8, 26)) is False

    def test_no_es_tardia_si_no_hay_valor_esperado(self):
        assert DS.germinacion_tardia(
            fecha_ingreso=date(2026, 6, 1), dias_germinar=None,
            germinado=False, hoy=date(2026, 8, 26)) is False

    def test_no_es_tardia_si_ya_germino(self):
        assert DS.germinacion_tardia(
            fecha_ingreso=date(2026, 6, 1), dias_germinar=21,
            germinado=True, hoy=date(2026, 8, 26)) is False

    def test_crecimiento_por_definir_sin_altura_esperada(self):
        assert DS.crecimiento_estado(
            altura_mm=3, esperada_mm=None, esperada_dias=None, edad_dias=40) == "por_definir"

    def test_crecimiento_lento_por_debajo_de_lo_esperado(self):
        assert DS.crecimiento_estado(
            altura_mm=2, esperada_mm=4, esperada_dias=30, edad_dias=35) == "lento"

    def test_crecimiento_a_tiempo_si_alcanza_lo_esperado(self):
        assert DS.crecimiento_estado(
            altura_mm=5, esperada_mm=4, esperada_dias=30, edad_dias=35) == "a_tiempo"

    def test_crecimiento_a_tiempo_si_aun_no_toca_evaluar(self):
        # edad < esperada_dias: todavía no se juzga como lento
        assert DS.crecimiento_estado(
            altura_mm=1, esperada_mm=4, esperada_dias=30, edad_dias=10) == "a_tiempo"
```

- [ ] **Step 2: Correr y ver que falla**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_service.py::TestEvaluadores -v"`
Expected: FAIL con `AttributeError: ... has no attribute 'germinacion_tardia'`

- [ ] **Step 3: Implementación mínima (añadir métodos a DiagnosticoService)**

```python
# backend/app/services/diagnostico_service.py  (añadir dentro de la clase)
    @staticmethod
    def germinacion_tardia(fecha_ingreso: date, dias_germinar, germinado: bool, hoy: date) -> bool:
        if germinado or dias_germinar is None:
            return False
        return (hoy - fecha_ingreso).days > dias_germinar

    @staticmethod
    def crecimiento_estado(altura_mm, esperada_mm, esperada_dias, edad_dias: int) -> str:
        if esperada_mm is None or esperada_dias is None:
            return "por_definir"
        if edad_dias < esperada_dias:
            return "a_tiempo"          # aún no toca evaluar
        if altura_mm is None:
            return "por_definir"
        return "a_tiempo" if altura_mm >= esperada_mm else "lento"
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_service.py::TestEvaluadores -v"`
Expected: PASS (8 passed)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/diagnostico_service.py backend/tests/test_diagnostico_service.py
git commit -m "feat(diagnostico): evaluadores de germinación tardía y crecimiento"
```

---

## Task 4: Helpers puros de germinación detectada y método de desinfección

**Files:**
- Modify: `backend/app/services/diagnostico_service.py`
- Test: `backend/tests/test_diagnostico_service.py`

- [ ] **Step 1: Escribir los tests que fallan**

```python
# backend/tests/test_diagnostico_service.py  (añadir al final)
class TestMetaHelpers:
    def test_esta_germinado_por_semillas_germinadas(self):
        assert DS.esta_germinado([{"semillas_germinadas": 2}]) is True

    def test_esta_germinado_falso_si_sin_germinacion(self):
        assert DS.esta_germinado([{"germinacion": "sin_germinacion"}]) is False

    def test_esta_germinado_por_marca_de_germinacion(self):
        assert DS.esta_germinado([{"germinacion": "germino"}]) is True

    def test_esta_germinado_vacio(self):
        assert DS.esta_germinado([]) is False

    def test_metodo_desde_protocolo_familia(self):
        assert DS.etiqueta_metodo({"protocolo_familia": "DESINF-02"}) == "DESINF-02"

    def test_metodo_desde_agentes(self):
        etq = DS.etiqueta_metodo({"agentes": ["hipoclorito (clorox)", "etanol (alcohol)"]})
        assert "clorox" in etq and "alcohol" in etq

    def test_metodo_desconocido(self):
        assert DS.etiqueta_metodo({}) == "método no especificado"

    def test_hallazgo_sin_contaminacion(self):
        h = DS.hallazgo("agua oxigenada 3%", tandas=5, germinaron=5, contaminadas=0)
        assert "no dio contaminación" in h

    def test_hallazgo_todo_contaminado(self):
        h = DS.hallazgo("alcohol+clorox", tandas=6, germinaron=0, contaminadas=6)
        assert "contaminó" in h
```

- [ ] **Step 2: Correr y ver que falla**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_service.py::TestMetaHelpers -v"`
Expected: FAIL con `AttributeError: ... has no attribute 'esta_germinado'`

- [ ] **Step 3: Implementación mínima (añadir a DiagnosticoService)**

```python
# backend/app/services/diagnostico_service.py  (añadir dentro de la clase)
    @staticmethod
    def esta_germinado(metas: list[dict]) -> bool:
        for m in metas:
            if not m:
                continue
            if (m.get("semillas_germinadas") or 0) > 0:
                return True
            g = m.get("germinacion")
            if g and g != "sin_germinacion":
                return True
        return False

    @staticmethod
    def etiqueta_metodo(meta: dict | None) -> str:
        meta = meta or {}
        if meta.get("protocolo_familia"):
            return meta["protocolo_familia"]
        if meta.get("protocolo"):
            return meta["protocolo"]
        agentes = meta.get("agentes")
        if agentes:
            return " + ".join(agentes)
        return "método no especificado"

    @staticmethod
    def hallazgo(metodo: str, tandas: int, germinaron: int, contaminadas: int) -> str:
        if tandas and contaminadas == 0:
            return f"con tus datos, {metodo} no dio contaminación."
        if tandas and contaminadas == tandas:
            return f"con tus datos, {metodo} contaminó todas las tandas."
        return f"{metodo}: {germinaron} germinaron, {contaminadas} contaminadas de {tandas}."
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_service.py::TestMetaHelpers -v"`
Expected: PASS (9 passed)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/diagnostico_service.py backend/tests/test_diagnostico_service.py
git commit -m "feat(diagnostico): helpers de germinación detectada y etiqueta de método"
```

---

## Task 5: Agregación `construir_diagnostico(db, hoy)`

Junta todo desde la BD y arma el payload. Test de integración con datos sembrados vía la sesión `db`.

**Files:**
- Modify: `backend/app/services/diagnostico_service.py`
- Test: `backend/tests/test_diagnostico_agregacion.py`

- [ ] **Step 1: Escribir el test que falla**

```python
# backend/tests/test_diagnostico_agregacion.py
from datetime import date, datetime, timedelta
from app import models
from app.services.diagnostico_service import DiagnosticoService as DS


def _usuario(db):
    u = db.query(models.Usuario).filter(models.Usuario.email == "diag@lab.com").first()
    if not u:
        u = models.Usuario(nombre="Diag", email="diag@lab.com",
                            hashed_password="x", rol="tecnico", activo=True)
        db.add(u); db.flush()
    return u


def test_contaminacion_y_germinacion_tardia(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="Testus contaminata",
                         nombre_comun="TestC",
                         config_estandar={"diagnostico": {"dias_germinar": 21}})
    db.add(esp); db.flush()

    sp = models.Especimen(uid="DIAG-SP-1", especie="TestC", especie_id=esp.id,
                          estado="activo", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    db.add(models.Evento(tipo="contaminacion", descripcion="cont",
                         especimen_id=sp.id, usuario_id=u.id,
                         timestamp=datetime(2026, 8, 20),
                         meta={"contaminacion": "confirmada"}))
    db.flush()

    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))

    cont_uids = [a["uid"] for a in payload["alertas"]["contaminacion"]]
    tard_uids = [a["uid"] for a in payload["alertas"]["germinacion_tardia"]]
    assert "DIAG-SP-1" in cont_uids
    assert "DIAG-SP-1" in tard_uids


def test_recordatorio_miercoles(db):
    payload_mie = DS.construir_diagnostico(db, hoy=date(2026, 9, 2))   # miércoles
    payload_jue = DS.construir_diagnostico(db, hoy=date(2026, 9, 3))   # jueves
    assert payload_mie["recordatorio_revision"]["activo"] is True
    assert payload_jue["recordatorio_revision"]["activo"] is False
```

- [ ] **Step 2: Correr y ver que falla**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_agregacion.py -v"`
Expected: FAIL con `AttributeError: ... has no attribute 'construir_diagnostico'`

- [ ] **Step 3: Implementación**

```python
# backend/app/services/diagnostico_service.py  (añadir imports arriba)
from collections import defaultdict
from app import models

# ...  (añadir dentro de la clase DiagnosticoService)
    @staticmethod
    def _estandar(especie) -> dict:
        cfg = (especie.config_estandar or {}) if especie else {}
        return cfg.get("diagnostico", {}) or {}

    @staticmethod
    def construir_diagnostico(db, hoy: date) -> dict:
        activos = db.query(models.Especimen).filter(
            models.Especimen.estado.in_(["activo", "contaminado"])).all()

        contaminacion, germinacion_tardia, sin_revisar = [], [], []
        crec_por_especie = defaultdict(lambda: {"germinadas": 0, "total": 0,
                                                "alturas": [], "estados": []})
        metodo_stats = defaultdict(lambda: {"tandas": 0, "germinaron": 0, "contaminadas": 0})
        ultimo_mie = DiagnosticoService.ultimo_miercoles(hoy)

        for sp in activos:
            eventos = list(sp.eventos)  # ordenados timestamp desc por el modelo
            metas = [e.meta or {} for e in eventos]
            especie_obj = sp.especie_rel
            nombre_especie = especie_obj.nombre_comun if especie_obj else sp.especie
            est = DiagnosticoService._estandar(especie_obj)
            germinado = DiagnosticoService.esta_germinado(metas)

            # ── Contaminación
            estado_cont = None
            for m in metas:
                if m.get("contaminacion") in ("confirmada", "sospechosa"):
                    estado_cont = m["contaminacion"]
                    break
            if estado_cont:
                contaminacion.append({"especimen_id": str(sp.id), "uid": sp.uid,
                                     "especie": nombre_especie, "estado": estado_cont})

            # ── Germinación tardía
            if DiagnosticoService.germinacion_tardia(
                    sp.fecha_ingreso, est.get("dias_germinar"), germinado, hoy):
                germinacion_tardia.append({
                    "especimen_id": str(sp.id), "uid": sp.uid, "especie": nombre_especie,
                    "dias": (hoy - sp.fecha_ingreso).days, "esperado": est.get("dias_germinar")})

            # ── Sin revisar (último registro anterior al miércoles pasado)
            fechas = [e.timestamp.date() for e in eventos if e.timestamp]
            fechas += [r.fecha.date() for r in sp.registros_evolucion if r.fecha]
            ultima = max(fechas) if fechas else sp.fecha_ingreso
            if ultima < ultimo_mie:
                sin_revisar.append({"especimen_id": str(sp.id), "uid": sp.uid,
                                    "especie": nombre_especie,
                                    "dias_sin_registro": (hoy - ultima).days})

            # ── Crecimiento vs esperado
            alturas = [r.altura_cm * 10 for r in sp.registros_evolucion if r.altura_cm is not None]
            altura_mm = max(alturas) if alturas else None
            edad = (hoy - sp.fecha_ingreso).days
            estado_crec = DiagnosticoService.crecimiento_estado(
                altura_mm, est.get("altura_esperada_mm"), est.get("altura_esperada_dias"), edad)
            g = crec_por_especie[nombre_especie]
            g["total"] += 1
            if germinado:
                g["germinadas"] += 1
            if altura_mm is not None:
                g["alturas"].append(altura_mm)
            g["estados"].append(estado_crec)

            # ── Método ↔ resultado (usa el evento de sanitización del espécimen)
            san = next((e for e in eventos if e.tipo == "sanitizacion"), None)
            if san:
                metodo = DiagnosticoService.etiqueta_metodo(san.meta)
                ms = metodo_stats[metodo]
                ms["tandas"] += 1
                if germinado:
                    ms["germinaron"] += 1
                if estado_cont:
                    ms["contaminadas"] += 1

        metodo_resultado = [
            {"metodo": metodo, "tandas": s["tandas"], "germinaron": s["germinaron"],
             "contaminadas": s["contaminadas"],
             "hallazgo": DiagnosticoService.hallazgo(metodo, s["tandas"], s["germinaron"], s["contaminadas"])}
            for metodo, s in metodo_stats.items()
        ]

        germinacion_crecimiento = []
        for especie, g in crec_por_especie.items():
            if "lento" in g["estados"]:
                estado = "lento"
            elif all(e == "por_definir" for e in g["estados"]):
                estado = "por_definir"
            else:
                estado = "a_tiempo"
            germinacion_crecimiento.append({
                "especie": especie, "germinadas": g["germinadas"], "total": g["total"],
                "altura_mm": max(g["alturas"]) if g["alturas"] else None,
                "estado_crecimiento": estado})

        return {
            "recordatorio_revision": {
                "activo": DiagnosticoService.es_dia_revision(hoy),
                "mensaje": MENSAJE_REVISION},
            "alertas": {"contaminacion": contaminacion,
                        "germinacion_tardia": germinacion_tardia,
                        "sin_revisar": sin_revisar},
            "metodo_resultado": metodo_resultado,
            "germinacion_crecimiento": germinacion_crecimiento,
        }
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_agregacion.py -v"`
Expected: PASS (2 passed)

- [ ] **Step 5: Verificar import-linter**

Run: `cd backend && PYTHONPATH=. import-linter lint`
Expected: `Contracts: N kept, 0 broken` (el service solo importa `app.models`, respeta capas)

- [ ] **Step 6: Commit**

```bash
git add backend/app/services/diagnostico_service.py backend/tests/test_diagnostico_agregacion.py
git commit -m "feat(diagnostico): agregación construir_diagnostico desde la BD"
```

---

## Task 6: Router `GET /diagnostico`

**Files:**
- Create: `backend/app/routers/diagnostico.py`
- Modify: `backend/app/main.py` (registrar el router)
- Test: `backend/tests/test_diagnostico_endpoint.py`

- [ ] **Step 1: Escribir el test que falla**

```python
# backend/tests/test_diagnostico_endpoint.py
def test_diagnostico_requiere_auth(client):
    res = client.get("/diagnostico")
    assert res.status_code in (401, 403)


def test_diagnostico_devuelve_estructura(auth_client):
    res = auth_client.get("/diagnostico")
    assert res.status_code == 200
    body = res.json()
    assert "recordatorio_revision" in body
    assert "alertas" in body
    assert set(["contaminacion", "germinacion_tardia", "sin_revisar"]).issubset(body["alertas"])
    assert "metodo_resultado" in body
    assert "germinacion_crecimiento" in body
```

- [ ] **Step 2: Correr y ver que falla**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest httpx && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_endpoint.py -v"`
Expected: FAIL con 404 (ruta no registrada)

- [ ] **Step 3: Implementar el router**

```python
# backend/app/routers/diagnostico.py
from datetime import date, timezone, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import auth
from app.services.diagnostico_service import DiagnosticoService

router = APIRouter(prefix="/diagnostico", tags=["diagnostico"])


@router.get("")
def obtener_diagnostico(db: Session = Depends(get_db),
                        _=Depends(auth.get_current_user)):
    hoy = datetime.now(timezone.utc).date()
    return DiagnosticoService.construir_diagnostico(db, hoy=hoy)
```

- [ ] **Step 4: Registrar el router en main.py**

Modify `backend/app/main.py`: en el bloque de imports de routers añade `diagnostico`, y junto a los `app.include_router(...)` (después de la línea 67 `app.include_router(agent.router)`) añade:

```python
from app.routers import diagnostico
app.include_router(diagnostico.router)
```

(Sigue el estilo existente de imports de routers al inicio del archivo; añade `diagnostico` a esa lista de imports y la llamada `include_router` al final del bloque.)

- [ ] **Step 5: Correr y ver que pasa**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest httpx && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/test_diagnostico_endpoint.py -v"`
Expected: PASS (2 passed)

- [ ] **Step 6: Commit**

```bash
git add backend/app/routers/diagnostico.py backend/app/main.py backend/tests/test_diagnostico_endpoint.py
git commit -m "feat(diagnostico): endpoint GET /diagnostico"
```

---

## Task 7: Frontend — tablero en Home.jsx

Reemplaza el contenido placeholder de `Home.jsx` por el tablero real que consume `/diagnostico`.

**Files:**
- Modify: `frontend/src/pages/Home.jsx`
- Test: `frontend/src/pages/__tests__/Home.test.jsx`

- [ ] **Step 1: Escribir el test que falla**

```jsx
// frontend/src/pages/__tests__/Home.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Home from '../Home'
import { api } from '../../api/client'

vi.mock('../../api/client', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

const PAYLOAD = {
  recordatorio_revision: { activo: true, mensaje: 'Hoy es día de revisión — revisa tus cultivos' },
  alertas: {
    contaminacion: [{ especimen_id: '1', uid: 'MOSB-1', especie: 'Mostaza', estado: 'confirmada' }],
    germinacion_tardia: [], sin_revisar: [],
  },
  metodo_resultado: [], germinacion_crecimiento: [],
}

test('muestra el recordatorio y la alerta de contaminación', async () => {
  api.get.mockResolvedValue(PAYLOAD)
  render(<MemoryRouter><Home /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/día de revisión/i)).toBeInTheDocument())
  expect(screen.getByText(/MOSB-1/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `cd frontend && npx vitest run src/pages/__tests__/Home.test.jsx`
Expected: FAIL (Home aún no llama a la API ni pinta el recordatorio)

- [ ] **Step 3: Implementar el tablero**

```jsx
// frontend/src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Home() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function cargar() {
    setError(null)
    try {
      setData(await api.get('/diagnostico'))
    } catch (e) {
      setError(e.message || 'No se pudo cargar el diagnóstico')
    }
  }
  useEffect(() => { cargar() }, [])

  if (error) return (
    <div style={s.wrap}>
      <div style={s.aviso}>{error}</div>
      <button style={s.btn} onClick={cargar}>Reintentar</button>
    </div>
  )
  if (!data) return <div style={s.wrap}><p style={s.muted}>Cargando tu diagnóstico…</p></div>

  const { recordatorio_revision: rec, alertas, metodo_resultado, germinacion_crecimiento } = data

  return (
    <div style={s.wrap}>
      {rec?.activo && <div style={s.recordatorio}>🗓️ {rec.mensaje}</div>}

      <section style={s.card}>
        <h3 style={s.h3}>① Lo que necesita tu atención</h3>
        <Bloque titulo="🔴 Contaminación" items={alertas.contaminacion}
                render={(a) => `${a.uid} — ${a.especie} (${a.estado})`} />
        <Bloque titulo="🟡 Germinación tardía" items={alertas.germinacion_tardia}
                render={(a) => `${a.uid} — ${a.especie}: ${a.dias} días (esperado ${a.esperado})`} />
        <Bloque titulo="🔵 Sin revisar" items={alertas.sin_revisar}
                render={(a) => `${a.uid} — ${a.especie}: ${a.dias_sin_registro} días sin registro`} />
      </section>

      <section style={s.card}>
        <h3 style={s.h3}>② Método de desinfección ↔ resultado</h3>
        {metodo_resultado.length === 0
          ? <p style={s.muted}>Aún no hay datos de métodos.</p>
          : metodo_resultado.map((m) => <p key={m.metodo} style={s.hallazgo}>• {m.hallazgo}</p>)}
      </section>

      <section style={s.card}>
        <h3 style={s.h3}>③ Germinación y crecimiento</h3>
        {germinacion_crecimiento.length === 0
          ? <p style={s.muted}>Aún no hay cultivos para mostrar.</p>
          : germinacion_crecimiento.map((g) => (
              <p key={g.especie} style={s.fila}>
                {g.especie}: {g.germinadas}/{g.total} germinadas
                {g.altura_mm != null ? `, ${g.altura_mm} mm` : ''} — {etiquetaEstado(g.estado_crecimiento)}
              </p>))}
      </section>
    </div>
  )
}

function Bloque({ titulo, items, render }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={s.bloqueTitulo}>{titulo}</div>
      {items.length === 0
        ? <p style={s.muted}>Nada pendiente.</p>
        : items.map((it) => <div key={it.especimen_id} style={s.item}>{render(it)}</div>)}
    </div>
  )
}

function etiquetaEstado(e) {
  return { a_tiempo: 'a tiempo', lento: 'lento', por_definir: 'por definir' }[e] || e
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  recordatorio: { background: '#2d7a47', color: '#eafff0', padding: '0.8rem 1rem',
                  borderRadius: 8, fontWeight: 600 },
  card: { background: '#1a2e1e', border: '1px solid #234', borderRadius: 10, padding: '1rem' },
  h3: { color: '#7dca8f', margin: '0 0 0.6rem' },
  bloqueTitulo: { color: '#cfe9d6', fontWeight: 600, marginBottom: '0.2rem' },
  item: { color: '#eafff0', padding: '0.25rem 0', borderBottom: '1px solid #234' },
  hallazgo: { color: '#eafff0', margin: '0.2rem 0' },
  fila: { color: '#eafff0', margin: '0.2rem 0' },
  muted: { color: '#7f9c86', fontSize: '0.9rem', margin: '0.2rem 0' },
  aviso: { background: '#3a1e1e', color: '#ffd6d6', padding: '0.8rem', borderRadius: 8 },
  btn: { background: '#4a8c5c', color: '#fff', border: 'none', borderRadius: 8,
         padding: '0.5rem 1rem', cursor: 'pointer', alignSelf: 'flex-start' },
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `cd frontend && npx vitest run src/pages/__tests__/Home.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home.jsx frontend/src/pages/__tests__/Home.test.jsx
git commit -m "feat(diagnostico): tablero de inicio consume /diagnostico"
```

---

## Task 8: Frontend — acción "Marcar contaminado"

Botón en cada frasco de la sección de contaminación / o botón general para marcar un espécimen. Reusa `POST /eventos`. Aquí se añade el botón a cada item de germinación tardía y sin revisar para poder marcarlo contaminado si la usuaria lo detecta.

**Files:**
- Modify: `frontend/src/pages/Home.jsx`
- Test: `frontend/src/pages/__tests__/Home.test.jsx`

- [ ] **Step 1: Escribir el test que falla**

```jsx
// frontend/src/pages/__tests__/Home.test.jsx  (añadir test)
import { fireEvent } from '@testing-library/react'

test('marcar contaminado hace POST y recarga', async () => {
  const conPendiente = {
    ...PAYLOAD,
    alertas: {
      contaminacion: [],
      germinacion_tardia: [{ especimen_id: '9', uid: 'ZINN-9', especie: 'Zinnia', dias: 30, esperado: 21 }],
      sin_revisar: [],
    },
  }
  api.get.mockResolvedValue(conPendiente)
  api.post.mockResolvedValue({})
  render(<MemoryRouter><Home /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/ZINN-9/)).toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: /marcar contaminado/i }))
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/eventos', expect.objectContaining({
    tipo: 'contaminacion', especimen_id: '9',
  })))
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `cd frontend && npx vitest run src/pages/__tests__/Home.test.jsx`
Expected: FAIL (no existe el botón "Marcar contaminado")

- [ ] **Step 3: Implementar la acción**

En `Home.jsx`, añade la función y pásala al `Bloque` de germinación tardía y sin revisar:

```jsx
// dentro de Home(), antes del return
async function marcarContaminado(especimen_id) {
  await api.post('/eventos', {
    tipo: 'contaminacion',
    descripcion: 'Marcado como contaminado desde el tablero de diagnóstico',
    especimen_id,
    meta: { contaminacion: 'confirmada' },
  })
  await cargar()
}
```

Modifica `Bloque` para aceptar una acción opcional:

```jsx
function Bloque({ titulo, items, render, onMarcar }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={s.bloqueTitulo}>{titulo}</div>
      {items.length === 0
        ? <p style={s.muted}>Nada pendiente.</p>
        : items.map((it) => (
            <div key={it.especimen_id} style={s.item}>
              <span>{render(it)}</span>
              {onMarcar && (
                <button style={s.btnMini} onClick={() => onMarcar(it.especimen_id)}>
                  Marcar contaminado
                </button>)}
            </div>))}
    </div>
  )
}
```

Pasa `onMarcar={marcarContaminado}` a los bloques de germinación tardía y sin revisar, y añade el estilo:

```jsx
// en const s = { ... }
  item: { color: '#eafff0', padding: '0.25rem 0', borderBottom: '1px solid #234',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  btnMini: { background: '#7a2d2d', color: '#fff', border: 'none', borderRadius: 6,
             padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `cd frontend && npx vitest run src/pages/__tests__/Home.test.jsx`
Expected: PASS (2 passed)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home.jsx frontend/src/pages/__tests__/Home.test.jsx
git commit -m "feat(diagnostico): acción marcar contaminado desde el tablero"
```

---

## Task 9: Conectar los escenarios BDD (step defs)

Implementa los step defs que hacen pasar el feature de la Task 1.

**Files:**
- Create: `backend/tests/step_defs/test_panel_diagnostico.py`

- [ ] **Step 1: Escribir los step defs**

```python
# backend/tests/step_defs/test_panel_diagnostico.py
from datetime import date, datetime, timedelta
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models
from app.services.diagnostico_service import DiagnosticoService as DS

scenarios('../../../docs/features/panel_diagnostico.feature')


@pytest.fixture
def ctx():
    return {}


def _usuario(db):
    u = db.query(models.Usuario).filter(models.Usuario.email == "bdd@lab.com").first()
    if not u:
        u = models.Usuario(nombre="BDD", email="bdd@lab.com",
                           hashed_password="x", rol="tecnico", activo=True)
        db.add(u); db.flush()
    return u


@given('estoy autenticada en el LBMS')
def autenticada(auth_client):
    pass


@given('un espécimen activo con un evento de contaminación "confirmada"')
def sp_contaminado(db, ctx):
    u = _usuario(db)
    sp = models.Especimen(uid="BDD-CONT-1", especie="X", estado="activo",
                         fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    db.add(models.Evento(tipo="contaminacion", descripcion="c", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 20),
                        meta={"contaminacion": "confirmada"}))
    db.flush()
    ctx["uid"] = "BDD-CONT-1"


@given(parsers.parse('una especie con "dias_germinar" esperado de {dias:d}'))
def especie_con_esperado(db, ctx, dias):
    esp = models.Especie(nombre_cientifico="BDD tardia",
                        config_estandar={"diagnostico": {"dias_germinar": dias}})
    db.add(esp); db.flush()
    ctx["especie_id"] = esp.id


@given('una especie sin "dias_germinar" definido')
def especie_sin_esperado(db, ctx):
    esp = models.Especie(nombre_cientifico="BDD sin esperado", config_estandar={})
    db.add(esp); db.flush()
    ctx["especie_id"] = esp.id


@given(parsers.parse('un espécimen de esa especie sembrado hace {dias:d} días sin germinar'))
def sp_sembrado(db, ctx, dias):
    sp = models.Especimen(uid=f"BDD-TARD-{dias}", especie="X", especie_id=ctx["especie_id"],
                         estado="activo", fecha_ingreso=date(2026, 8, 30) - timedelta(days=dias))
    db.add(sp); db.flush()
    ctx["uid"] = sp.uid


@when('pido el diagnóstico')
def pido_diagnostico(db, ctx):
    ctx["payload"] = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))


@when('pido el diagnóstico un miércoles')
def pido_miercoles(db, ctx):
    ctx["payload"] = DS.construir_diagnostico(db, hoy=date(2026, 9, 2))


@when('pido el diagnóstico un jueves')
def pido_jueves(db, ctx):
    ctx["payload"] = DS.construir_diagnostico(db, hoy=date(2026, 9, 3))


@then('la alerta de contaminación incluye ese espécimen')
def then_contaminacion(ctx):
    uids = [a["uid"] for a in ctx["payload"]["alertas"]["contaminacion"]]
    assert ctx["uid"] in uids


@then('la alerta de germinación tardía incluye ese espécimen')
def then_tardia_si(ctx):
    uids = [a["uid"] for a in ctx["payload"]["alertas"]["germinacion_tardia"]]
    assert ctx["uid"] in uids


@then('la alerta de germinación tardía no incluye ese espécimen')
def then_tardia_no(ctx):
    uids = [a["uid"] for a in ctx["payload"]["alertas"]["germinacion_tardia"]]
    assert ctx["uid"] not in uids


@then('el recordatorio de revisión está activo')
def then_rec_si(ctx):
    assert ctx["payload"]["recordatorio_revision"]["activo"] is True


@then('el recordatorio de revisión no está activo')
def then_rec_no(ctx):
    assert ctx["payload"]["recordatorio_revision"]["activo"] is False
```

- [ ] **Step 2: Correr y ver que pasa**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest pytest-bdd httpx && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/step_defs/test_panel_diagnostico.py -v"`
Expected: PASS (5 escenarios)

- [ ] **Step 3: Commit**

```bash
git add backend/tests/step_defs/test_panel_diagnostico.py
git commit -m "test(diagnostico): step defs BDD del panel de diagnóstico"
```

---

## Task 10: Verificación final completa

- [ ] **Step 1: Toda la suite de backend contra lbms_test**

Run: `docker compose run --rm -v "$(pwd):/workspace" --workdir /workspace/backend --entrypoint "" backend sh -c "pip install -q pytest pytest-bdd httpx pytest-cov && DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/lbms_test python -m pytest tests/ -v"`
Expected: PASS (toda la suite, sin regresiones)

- [ ] **Step 2: import-linter**

Run: `cd backend && PYTHONPATH=. import-linter lint`
Expected: `Contracts: N kept, 0 broken`

- [ ] **Step 3: Tests de frontend**

Run: `cd frontend && npx vitest run`
Expected: PASS

- [ ] **Step 4: Prueba manual rápida**

Levanta el entorno (`docker compose up -d`), entra a la plataforma y verifica que el tablero de inicio muestra las tres secciones, el recordatorio (si es miércoles), y que "Marcar contaminado" mueve el frasco a la sección de contaminación al recargar.

- [ ] **Step 5: (opcional) definir tiempos esperados**

Para probar germinación tardía/crecimiento con datos reales, define `config_estandar.diagnostico` de una especie vía `PATCH /especies/{id}` con body `{"config_estandar": {"diagnostico": {"dias_germinar": 21}}}` (respetando/mezclando lo que ya tenga config_estandar).

---

## Notas de decisiones de diseño

- **Sin migración:** los valores esperados viven en `especies.config_estandar["diagnostico"]` (columna JSONB existente) y se guardan con el `PATCH /especies/{id}` ya existente. La usuaria no tiene permisos para migrar BD; esto lo evita.
- **Altura:** los registros guardan `altura_cm`; el tablero y los valores esperados usan **mm** (plántulas in vitro son pequeñas). Se convierte `cm*10 = mm`.
- **"Sin revisar":** usa el miércoles ESTRICTAMENTE anterior a hoy (no el de hoy), para no marcar todo como pendiente cada miércoles por la mañana; ese día el recordatorio ya avisa.
- **`config_estandar` vs `ficha`:** se eligió `config_estandar` (existe y es para configuración científica) en vez de `ficha` (perfil biológico/wiki).
- **Alcance v1:** sin día de gracia, sin ritmos por especie, sin notificaciones fuera de la app. Editar valores esperados por especie se hace vía el endpoint existente; una UI dedicada de captura queda para una iteración posterior si la usuaria la pide.
```
