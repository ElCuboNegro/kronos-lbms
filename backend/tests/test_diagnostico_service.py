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
