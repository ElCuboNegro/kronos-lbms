from datetime import date, timedelta
from collections import defaultdict
from app import models

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

            # ── Contaminación (por meta o por estado del espécimen)
            estado_cont = None
            for m in metas:
                if m.get("contaminacion") in ("confirmada", "sospechosa"):
                    estado_cont = m["contaminacion"]
                    break
            contaminado = bool(estado_cont) or sp.estado == "contaminado"
            if contaminado:
                contaminacion.append({"especimen_id": str(sp.id), "uid": sp.uid,
                                     "especie": nombre_especie,
                                     "estado": estado_cont or "confirmada"})

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
            # Nota: los especímenes sin evento de sanitización no entran en el cruce método↔resultado.
            san = next((e for e in eventos if e.tipo == "sanitizacion"), None)
            if san:
                metodo = DiagnosticoService.etiqueta_metodo(san.meta)
                ms = metodo_stats[metodo]
                ms["tandas"] += 1
                if germinado:
                    ms["germinaron"] += 1
                if contaminado:
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
