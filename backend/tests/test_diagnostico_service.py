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
