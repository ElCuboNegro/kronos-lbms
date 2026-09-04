# Steps BDD para la generación de tratamientos del diseño factorial.
"""Prueba de aceptación BDD — Paso 3: generación de tratamientos (producto cartesiano).

Ata docs/features/generacion_tratamientos.feature. Se escribe ANTES de implementar
(BDD primero): debe quedar en ROJO hasta que existan los modelos/endpoints de
factores y tratamientos. Caja negra contra la API (como test_experiment_management.py).
"""
import pytest
from pytest_bdd import scenario, given, when, then, parsers

_FEATURE = '../../../docs/features/generacion_tratamientos.feature'
_PENDIENTE = pytest.mark.xfail(
    reason="Pendiente (incremento siguiente): testigo/control automático, "
           "descartar/confirmar y validaciones de niveles. Plan 1 implementó "
           "solo el producto cartesiano (usuario eligió 'solo combinaciones').",
    strict=False,
)


@_PENDIENTE
@scenario(_FEATURE, 'El producto cartesiano genera un tratamiento por combinación')
def test_producto_cartesiano():
    pass


@_PENDIENTE
@scenario(_FEATURE, 'El usuario descarta una combinación antes de confirmar')
def test_descartar_combinacion():
    pass


@_PENDIENTE
@scenario(_FEATURE, 'Un tratamiento admite a lo más un nivel por factor')
def test_un_nivel_por_factor():
    pass


@_PENDIENTE
@scenario(_FEATURE, 'No se puede borrar un nivel usado por un tratamiento confirmado')
def test_no_borrar_nivel_usado():
    pass

# Estados de respuesta que cuentan como "rechazo de negocio" (no un 404 de ruta inexistente).
RECHAZO = (400, 409, 422)


@pytest.fixture
def ctx():
    return {"descartes": []}


def _niveles_payload(*etiquetas):
    return [{"etiqueta": e, "orden": i} for i, e in enumerate(etiquetas, start=1)]


# ─── Antecedentes (Dado / Y) ────────────────────────────────────────────────
@given(parsers.parse('un experimento "{nombre}" con tipo de diseño "{tipo}"'))
def crear_experimento(auth_client, ctx, nombre, tipo):
    res = auth_client.post("/experimentos", json={
        "nombre": nombre, "fecha_inicio": "2026-01-01", "tipo_diseno": tipo,
    })
    assert res.status_code == 201, res.text
    ctx["eid"] = res.json()["id"]


@given(parsers.parse('un factor "{nombre}" con niveles "{n1}" y "{n2}"'))
def crear_factor(auth_client, ctx, nombre, n1, n2):
    res = auth_client.post(f"/experimentos/{ctx['eid']}/factores", json={
        "nombre": nombre, "tipo": "categorico", "niveles": _niveles_payload(n1, n2),
    })
    assert res.status_code == 201, res.text


# ─── Cuando / Y ─────────────────────────────────────────────────────────────
@when('el sistema sugiere los tratamientos')
def sugerir_tratamientos(auth_client, ctx):
    res = auth_client.post(f"/experimentos/{ctx['eid']}/tratamientos/generar")
    ctx["response"] = res
    ctx["tratamientos"] = res.json() if res.status_code in (200, 201) else []


@when(parsers.parse('el usuario descarta la combinación "{c1}" con "{c2}"'))
def descartar_combinacion(ctx, c1, c2):
    ctx["descartes"].append([c1, c2])


@when('el usuario confirma el diseño')
def confirmar_diseno(auth_client, ctx):
    res = auth_client.post(f"/experimentos/{ctx['eid']}/tratamientos/confirmar",
                           json={"descartar": ctx["descartes"]})
    ctx["response"] = res


@when(parsers.parse('se intenta crear un tratamiento con los niveles "{na}" y "{nb}" del factor "{factor}"'))
def crear_tratamiento_invalido(auth_client, ctx, na, nb, factor):
    res = auth_client.post(f"/experimentos/{ctx['eid']}/tratamientos", json={
        "codigo": "TX",
        "niveles": [{"factor": factor, "etiqueta": na},
                    {"factor": factor, "etiqueta": nb}],
    })
    ctx["response"] = res


@when(parsers.parse('se intenta borrar el nivel "{nivel}"'))
def borrar_nivel(auth_client, ctx, nivel):
    res = auth_client.delete(f"/experimentos/{ctx['eid']}/niveles/{ctx.get('nivel_id')}")
    ctx["response"] = res


# ─── Dado (escenario 4) ─────────────────────────────────────────────────────
@given(parsers.parse('un tratamiento confirmado que usa el nivel "{nivel}" del factor "{factor}"'))
def tratamiento_confirmado_usa_nivel(auth_client, ctx, nivel, factor):
    auth_client.post(f"/experimentos/{ctx['eid']}/tratamientos/generar")
    res = auth_client.get(f"/experimentos/{ctx['eid']}/factores")
    assert res.status_code == 200, res.text
    for f in res.json():
        if f["nombre"] == factor:
            for nv in f["niveles"]:
                if nv["etiqueta"] == nivel:
                    ctx["nivel_id"] = nv["id"]
    assert ctx.get("nivel_id"), "no se encontró el nivel a usar/borrar"


# ─── Entonces / Y ───────────────────────────────────────────────────────────
@then(parsers.parse('se generan {n:d} tratamientos'))
def verificar_cantidad_generada(ctx, n):
    assert ctx["response"].status_code in (200, 201), ctx["response"].text
    assert len(ctx["tratamientos"]) == n


@then(parsers.parse('existe un tratamiento con "{combo1}" y "{combo2}"'))
def verificar_combinacion_existe(ctx, combo1, combo2):
    assert any(combo1 in (t.get("nombre") or "") and combo2 in (t.get("nombre") or "")
               for t in ctx["tratamientos"]), \
        f"ningún tratamiento contiene {combo1} y {combo2}: {ctx['tratamientos']}"


@then('se añade un tratamiento adicional marcado como control')
def verificar_control(ctx):
    assert any(t.get("es_control") for t in ctx["tratamientos"]), \
        "no se generó un tratamiento de control"


@then(parsers.parse('el experimento queda con {n:d} tratamientos más el control'))
def verificar_tras_confirmar(auth_client, ctx, n):
    res = auth_client.get(f"/experimentos/{ctx['eid']}/tratamientos")
    assert res.status_code == 200, res.text
    tratamientos = res.json()
    no_control = [t for t in tratamientos if not t.get("es_control")]
    assert len(no_control) == n, f"esperaba {n} no-control, hay {len(no_control)}"
    assert any(t.get("es_control") for t in tratamientos), "falta el tratamiento de control"


@then('la operación es rechazada')
def verificar_rechazo(ctx):
    assert ctx["response"].status_code in RECHAZO, \
        f"esperaba rechazo {RECHAZO}, fue {ctx['response'].status_code}: {ctx['response'].text}"


@then(parsers.parse('se informa que {mensaje}'))
def verificar_mensaje(ctx, mensaje):
    cuerpo = ctx["response"].json()
    assert cuerpo.get("detail"), f"no se informó ningún detalle del rechazo: {cuerpo}"
