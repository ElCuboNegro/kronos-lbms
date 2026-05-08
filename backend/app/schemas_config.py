from typing import Optional
from pydantic import BaseModel, Field

class ScientificConfig(BaseModel):
    """Esquema estricto para configuraciones científicas (config_estandar)."""
    temp_ideal_c: Optional[float] = Field(None, description="Temperatura ideal en Celsius")
    humedad_relativa_pct: Optional[float] = Field(None, description="Humedad relativa en porcentaje")
    iluminacion_lux: Optional[int] = Field(None, description="Intensidad de iluminación en Lux")
    concentracion_x: Optional[float] = Field(None, description="Concentración (ej: 1.0 para MS basal)")
    caducidad_dias: Optional[int] = Field(None, description="Días hasta la caducidad")
    ph_objetivo: Optional[float] = Field(None, description="pH objetivo del medio")

    class Config:
        extra = "forbid" # Prohibir campos no definidos para evitar basura
