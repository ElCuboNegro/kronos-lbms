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
