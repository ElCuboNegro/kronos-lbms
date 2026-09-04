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


def test_metodo_resultado_cruza_desinfeccion_y_contaminacion(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="Metodo test", nombre_comun="MetodoT")
    db.add(esp); db.flush()
    # Espécimen desinfectado que se contaminó
    sp = models.Especimen(uid="MET-1", especie="MetodoT", especie_id=esp.id,
                          estado="activo", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    db.add(models.Evento(tipo="sanitizacion", descripcion="s", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 1),
                        meta={"protocolo_familia": "DESINF-02"}))
    db.add(models.Evento(tipo="observacion", descripcion="o", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 20),
                        meta={"contaminacion": "confirmada"}))
    db.flush()

    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))
    filas = {m["metodo"]: m for m in payload["metodo_resultado"]}
    assert "DESINF-02" in filas
    assert filas["DESINF-02"]["tandas"] == 1
    assert filas["DESINF-02"]["contaminadas"] == 1
    assert "contamin" in filas["DESINF-02"]["hallazgo"]


def test_sin_revisar_detecta_frascos_sin_registro_reciente(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="Sinrev test", nombre_comun="SinRev")
    db.add(esp); db.flush()
    # Sembrado hace mucho, sin ningún registro -> sin revisar
    viejo = models.Especimen(uid="REV-VIEJO", especie="SinRev", especie_id=esp.id,
                            estado="activo", fecha_ingreso=date(2026, 8, 1))
    # Con registro reciente (posterior al último miércoles) -> NO sin revisar
    reciente = models.Especimen(uid="REV-OK", especie="SinRev", especie_id=esp.id,
                               estado="activo", fecha_ingreso=date(2026, 8, 1))
    db.add_all([viejo, reciente]); db.flush()
    db.add(models.Evento(tipo="observacion", descripcion="o", especimen_id=reciente.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 28),
                        meta={"revision": "ok"}))
    db.flush()

    # hoy = domingo 2026-08-30 -> ultimo_miercoles = 2026-08-26
    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))
    uids = [a["uid"] for a in payload["alertas"]["sin_revisar"]]
    assert "REV-VIEJO" in uids
    assert "REV-OK" not in uids


def test_crecimiento_lento_en_rollup_por_especie(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="Crece test", nombre_comun="CreceT",
                        config_estandar={"diagnostico": {"altura_esperada_mm": 4,
                                                         "altura_esperada_dias": 20}})
    db.add(esp); db.flush()
    sp = models.Especimen(uid="CREC-1", especie="CreceT", especie_id=esp.id,
                         estado="activo", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    # edad a 2026-08-30 = 29 días (>=20); altura 0.2 cm = 2 mm < 4 mm esperado -> lento
    db.add(models.RegistroEvolucion(especimen_id=sp.id, registrado_por_id=u.id,
                                    fecha=datetime(2026, 8, 25), altura_cm=0.2))
    db.flush()

    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))
    filas = {g["especie"]: g for g in payload["germinacion_crecimiento"]}
    assert filas["CreceT"]["estado_crecimiento"] == "lento"
    assert filas["CreceT"]["altura_mm"] == 2.0


def test_contaminacion_por_estado_sin_meta(db):
    esp = models.Especie(nombre_cientifico="Estado test", nombre_comun="EstadoT")
    db.add(esp); db.flush()
    sp = models.Especimen(uid="EST-1", especie="EstadoT", especie_id=esp.id,
                         estado="contaminado", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))
    uids = [a["uid"] for a in payload["alertas"]["contaminacion"]]
    assert "EST-1" in uids


def test_deshacer_contaminacion_quita_la_alerta(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="Deshacer test", nombre_comun="DeshT")
    db.add(esp); db.flush()
    sp = models.Especimen(uid="UNDO-1", especie="DeshT", especie_id=esp.id,
                         estado="contaminado", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    # Evento original de contaminación...
    db.add(models.Evento(tipo="contaminacion", descripcion="c", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 20),
                        meta={"contaminacion": "confirmada"}))
    # ...y un evento MÁS RECIENTE que la deshace
    db.add(models.Evento(tipo="observacion", descripcion="deshacer", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 22),
                        meta={"contaminacion": "descartada"}))
    db.flush()

    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))
    uids = [a["uid"] for a in payload["alertas"]["contaminacion"]]
    assert "UNDO-1" not in uids


def test_contaminacion_incluye_tipo_y_fecha(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="TipoFecha test", nombre_comun="TipoF")
    db.add(esp); db.flush()
    sp = models.Especimen(uid="TIPO-1", especie="TipoF", especie_id=esp.id,
                         estado="activo", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    db.add(models.Evento(tipo="contaminacion", descripcion="c", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 20),
                        meta={"contaminacion": "confirmada", "tipo_contaminante": "hongo",
                              "fecha_deteccion": "2026-08-25"}))
    db.flush()

    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))
    fila = next(a for a in payload["alertas"]["contaminacion"] if a["uid"] == "TIPO-1")
    assert fila["tipo_contaminante"] == "hongo"
    assert fila["fecha"] == "2026-08-25"
