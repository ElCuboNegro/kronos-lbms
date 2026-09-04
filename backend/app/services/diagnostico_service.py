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
