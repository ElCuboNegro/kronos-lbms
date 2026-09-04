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


class TestMejorMetodo:
    def test_elige_el_de_menor_contaminacion(self):
        filas = [
            {"metodo": "alcohol+clorox", "tandas": 6, "germinaron": 0, "contaminadas": 6},
            {"metodo": "agua oxigenada 3%", "tandas": 5, "germinaron": 5, "contaminadas": 0},
        ]
        mejor = DS.mejor_metodo(filas)
        assert mejor["metodo"] == "agua oxigenada 3%"
        assert "5" in mejor["motivo"]

    def test_desempata_por_mas_germinacion(self):
        filas = [
            {"metodo": "A", "tandas": 4, "germinaron": 1, "contaminadas": 0},
            {"metodo": "B", "tandas": 4, "germinaron": 4, "contaminadas": 0},
        ]
        assert DS.mejor_metodo(filas)["metodo"] == "B"

    def test_sin_datos_devuelve_none(self):
        assert DS.mejor_metodo([]) is None
        assert DS.mejor_metodo([{"metodo": "X", "tandas": 0, "germinaron": 0, "contaminadas": 0}]) is None
