from __future__ import annotations
from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str


# ── Usuario ───────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: str = "tecnico"


class UsuarioOut(BaseModel):
    id: UUID
    nombre: str
    email: str
    rol: str
    activo: bool
    foto_url: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class PasswordChange(BaseModel):
    password_actual: str
    password_nuevo: str


class UsuarioListItem(BaseModel):
    id: UUID
    nombre: str
    email: str
    rol: str
    activo: bool
    foto_url: Optional[str] = None
    model_config = {"from_attributes": True}


# ── Especie / Linea / Variegacion ─────────────────────────────────────────────

class EspecieCreate(BaseModel):
    codigo: str
    nombre_cientifico: str
    categoria: str = "especie"
    nombre_comun: Optional[str] = None
    familia: Optional[str] = None
    genero: Optional[str] = None
    descripcion: Optional[str] = None
    requerimientos: Optional[dict[str, Any]] = None
    config_estandar: Optional[dict[str, Any]] = None


class EspecieUpdate(BaseModel):
    codigo: Optional[str] = None
    categoria: Optional[str] = None
    nombre_comun: Optional[str] = None
    familia: Optional[str] = None
    genero: Optional[str] = None
    descripcion: Optional[str] = None
    requerimientos: Optional[dict[str, Any]] = None
    config_estandar: Optional[dict[str, Any]] = None
    ficha: Optional[dict[str, Any]] = None


class LineaCreate(BaseModel):
    nombre: str
    metodo_propagacion: str = "desconocido"
    descripcion: Optional[str] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None


class LineaUpdate(BaseModel):
    nombre: Optional[str] = None
    metodo_propagacion: Optional[str] = None
    descripcion: Optional[str] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None


class VariegacionCreate(BaseModel):
    nombre: str
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None


class VariegacionUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None


class VariegacionOut(BaseModel):
    id: UUID
    linea_id: UUID
    nombre: str
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None
    created_at: datetime
    total_individuos: int = 0
    model_config = {"from_attributes": True}


class LineaOut(BaseModel):
    id: UUID
    especie_id: UUID
    nombre: str
    metodo_propagacion: str
    descripcion: Optional[str]
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str]
    created_at: datetime
    variegaciones: list[VariegacionOut] = []
    total_individuos: int = 0
    model_config = {"from_attributes": True}


class EspecieOut(BaseModel):
    id: UUID
    codigo: Optional[str] = None
    nombre_cientifico: str
    categoria: str
    nombre_comun: Optional[str]
    familia: Optional[str]
    genero: Optional[str]
    descripcion: Optional[str]
    requerimientos: Optional[dict[str, Any]]
    config_estandar: Optional[dict[str, Any]] = None
    ficha: Optional[dict[str, Any]] = None
    created_at: datetime
    lineas: list[LineaOut] = []
    total_individuos: int = 0
    model_config = {"from_attributes": True}


class EspecieListItem(BaseModel):
    id: UUID
    codigo: Optional[str] = None
    nombre_cientifico: str
    categoria: str
    nombre_comun: Optional[str]
    familia: Optional[str]
    total_lineas: int = 0
    total_individuos: int = 0
    model_config = {"from_attributes": True}


# ── Especimen ─────────────────────────────────────────────────────────────────

class EspecimenCreate(BaseModel):
    uid: str
    contenedor_uid: Optional[str] = None
    especie: str
    especie_id: Optional[UUID] = None
    linea_id: Optional[UUID] = None
    variegacion_id: Optional[UUID] = None
    madre_id: Optional[UUID] = None
    padre_id: Optional[UUID] = None
    fecha_ingreso: date
    origen: Optional[str] = None
    coordenadas: Optional[dict[str, float]] = None
    estado: str = "activo"
    notas: Optional[str] = None


class EspecimenUpdate(BaseModel):
    contenedor_uid: Optional[str] = None
    especie: Optional[str] = None
    especie_id: Optional[UUID] = None
    linea_id: Optional[UUID] = None
    variegacion_id: Optional[UUID] = None
    madre_id: Optional[UUID] = None
    padre_id: Optional[UUID] = None
    origen: Optional[str] = None
    coordenadas: Optional[dict[str, float]] = None
    estado: Optional[str] = None
    notas: Optional[str] = None


class EventoSummary(BaseModel):
    id: UUID
    tipo: str
    descripcion: str
    timestamp: datetime
    usuario_nombre: str
    ejecutado_por_nombre: Optional[str] = None
    model_config = {"from_attributes": True}


class EspecimenBulkItem(BaseModel):
    cantidad: int
    protocolo_id: Optional[UUID] = None
    notas: Optional[str] = None

class MoverContenedorRequest(BaseModel):
    especimen_ids: list[UUID]
    destino_contenedor_uid: str
    notas: Optional[str] = None

class EspecimenBulkRequest(BaseModel):
    especie_id: UUID
    linea_id: Optional[UUID] = None
    variegacion_id: Optional[UUID] = None
    madre_id: Optional[UUID] = None
    padre_id: Optional[UUID] = None
    contenedor_uid: Optional[str] = None
    fecha_ingreso: date
    origen: Optional[str] = None
    coordenadas: Optional[dict[str, float]] = None
    estado: str = "activo"
    items: list[EspecimenBulkItem]

class EspecimenOut(BaseModel):
    id: UUID
    uid: str
    contenedor_uid: Optional[str] = None
    especie: str
    especie_id: Optional[UUID]
    linea_id: Optional[UUID]
    linea_nombre: Optional[str] = None
    variegacion_id: Optional[UUID]
    variegacion_nombre: Optional[str] = None
    madre_id: Optional[UUID] = None
    madre_uid: Optional[str] = None
    padre_id: Optional[UUID] = None
    padre_uid: Optional[str] = None
    fecha_ingreso: date
    origen: Optional[str]
    coordenadas: Optional[dict[str, float]] = None
    estado: str
    notas: Optional[str]
    created_at: datetime
    eventos: list[EventoSummary] = []
    model_config = {"from_attributes": True}


class EspecimenListItem(BaseModel):
    id: UUID
    uid: str
    contenedor_uid: Optional[str] = None
    especie: str
    especie_id: Optional[UUID] = None
    linea_id: Optional[UUID] = None
    linea_nombre: Optional[str] = None
    variegacion_nombre: Optional[str] = None
    estado: str
    fecha_ingreso: date
    model_config = {"from_attributes": True}


# ── Elemento ──────────────────────────────────────────────────────────────────

class ElementoCreate(BaseModel):
    element_id: str
    tipo: str
    descripcion: str
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    estado: str = "activo"
    notas: Optional[str] = None


class ElementoUpdate(BaseModel):
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    estado: Optional[str] = None
    notas: Optional[str] = None


class ElementoOut(BaseModel):
    id: UUID
    element_id: str
    tipo: str
    descripcion: str
    cantidad: Optional[float]
    unidad: Optional[str]
    estado: str
    notas: Optional[str]
    created_at: datetime
    eventos: list[EventoSummary] = []
    model_config = {"from_attributes": True}


class ElementoListItem(BaseModel):
    id: UUID
    element_id: str
    tipo: str
    descripcion: str
    estado: str
    model_config = {"from_attributes": True}


# ── Protocolo ─────────────────────────────────────────────────────────────────

class ProtocoloMaterial(BaseModel):
    nombre: str
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    notas: Optional[str] = None

class ProtocoloPaso(BaseModel):
    orden: int
    instruccion: str
    tiempo_minutos: Optional[int] = None
    notas: Optional[str] = None

class ProtocoloCreate(BaseModel):
    nombre: str
    tipo: str
    version: str = "1.0"
    descripcion: Optional[str] = None
    pasos: list[ProtocoloPaso] = []
    materiales: Optional[list[ProtocoloMaterial]] = None


class ProtocoloUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    version: Optional[str] = None
    pasos: Optional[list[dict[str, Any]]] = None
    materiales: Optional[list[dict[str, Any]]] = None
    estado_validacion: Optional[str] = None


class ValidacionOut(BaseModel):
    id: UUID
    resultado: str
    observaciones: str
    metricas: Optional[dict[str, Any]]
    fecha: datetime
    usuario_nombre: str
    model_config = {"from_attributes": True}


class ProtocoloOut(BaseModel):
    id: UUID
    nombre: str
    tipo: str
    version: str
    descripcion: Optional[str]
    pasos: list[dict[str, Any]]
    materiales: Optional[list[dict[str, Any]]]
    estado_validacion: str
    creado_por_id: UUID
    created_at: datetime
    updated_at: datetime
    validaciones: list[ValidacionOut] = []
    model_config = {"from_attributes": True}


class ProtocoloListItem(BaseModel):
    id: UUID
    nombre: str
    tipo: str
    version: str
    estado_validacion: str
    model_config = {"from_attributes": True}


class ValidacionCreate(BaseModel):
    resultado: str  # exitoso, fallido, parcial
    observaciones: str
    metricas: Optional[dict[str, Any]] = None
    experimento_id: Optional[UUID] = None


# ── Experimento ───────────────────────────────────────────────────────────────

class ExperimentoCreate(BaseModel):
    nombre: str
    hipotesis: Optional[str] = None
    protocolo_id: Optional[UUID] = None
    especie_id: Optional[UUID] = None
    linea_id: Optional[UUID] = None
    variegacion_id: Optional[UUID] = None
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    estado: str = "activo"
    director_id: Optional[UUID] = None   # si None, se asigna el usuario autenticado
    operador_id: Optional[UUID] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None
    especimen_ids: list[UUID] = []
    elemento_ids: list[UUID] = []


class ExperimentoUpdate(BaseModel):
    nombre: Optional[str] = None
    hipotesis: Optional[str] = None
    protocolo_id: Optional[UUID] = None
    especie_id: Optional[UUID] = None
    linea_id: Optional[UUID] = None
    variegacion_id: Optional[UUID] = None
    fecha_fin: Optional[date] = None
    estado: Optional[str] = None
    director_id: Optional[UUID] = None
    operador_id: Optional[UUID] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str] = None


class ExperimentoOut(BaseModel):
    id: UUID
    nombre: str
    hipotesis: Optional[str]
    protocolo_id: Optional[UUID]
    especie_id: Optional[UUID] = None
    linea_id: Optional[UUID] = None
    variegacion_id: Optional[UUID] = None
    fecha_inicio: date
    fecha_fin: Optional[date]
    estado: str
    director_id: UUID
    director_nombre: Optional[str] = None
    operador_id: Optional[UUID]
    operador_nombre: Optional[str] = None
    config_estandar: Optional[dict[str, Any]] = None
    notas: Optional[str]
    created_at: datetime
    especimenes: list[EspecimenListItem] = []
    model_config = {"from_attributes": True}


class ExperimentoListItem(BaseModel):
    id: UUID
    nombre: str
    estado: str
    fecha_inicio: date
    model_config = {"from_attributes": True}


# ── Resultado Investigación ───────────────────────────────────────────────────

class ResultadoCreate(BaseModel):
    titulo: str
    tipo: str  # observacion, medicion, fotografia, hallazgo, conclusion, anomalia
    descripcion: str
    datos: Optional[dict[str, Any]] = None
    archivos: Optional[list[str]] = None


class ResultadoOut(BaseModel):
    id: UUID
    experimento_id: UUID
    titulo: str
    tipo: str
    descripcion: str
    datos: Optional[dict[str, Any]]
    archivos: Optional[list[str]]
    registrado_por_id: UUID
    fecha: datetime
    model_config = {"from_attributes": True}


# ── Evento ────────────────────────────────────────────────────────────────────

class EventoCreate(BaseModel):
    tipo: str
    descripcion: str
    especimen_id: Optional[UUID] = None
    elemento_id: Optional[UUID] = None
    experimento_id: Optional[UUID] = None
    ejecutado_por_id: Optional[UUID] = None
    meta: Optional[dict[str, Any]] = None


class EventoOut(BaseModel):
    id: UUID
    tipo: str
    descripcion: str
    especimen_id: Optional[UUID]
    elemento_id: Optional[UUID]
    experimento_id: Optional[UUID]
    usuario_id: UUID
    ejecutado_por_id: Optional[UUID]
    ejecutado_por_nombre: Optional[str] = None
    timestamp: datetime
    meta: Optional[dict[str, Any]]
    model_config = {"from_attributes": True}


# ── Sustrato ──────────────────────────────────────────────────────────────────

class SustratoCreate(BaseModel):
    codigo_formulacion: str
    tipo: str = "sustrato"
    nombre: str
    descripcion: Optional[str] = None
    componentes: Optional[list[ComponenteCreate]] = None
    ph_teorico: Optional[float] = None
    conductividad_teorica: Optional[float] = None
    formulacion_id: Optional[UUID] = None
    lote_id: Optional[UUID] = None


class SustratoOut(BaseModel):
    id: UUID
    codigo_formulacion: str
    tipo: str
    nombre: str
    descripcion: Optional[str]
    componentes: Optional[list[ComponenteOut]] = None
    ph_teorico: Optional[float]
    conductividad_teorica: Optional[float]
    formulacion_id: Optional[UUID] = None
    lote_id: Optional[UUID] = None
    formulacion: Optional[FormulacionOut] = None
    lote: Optional[LotePreparadoOut] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Registro de Evolución ─────────────────────────────────────────────────────

ANGULOS = ("arriba", "frente", "atras", "izquierda", "derecha")
PATRONES_VARIEGACION = ("sector", "half_moon", "moteado", "marble", "full", "none")
COLORES_VARIEGACION = ("blanco", "crema", "amarillo", "mint", "none")
SUSTRATOS = ("akadama", "sphagnum", "perlita", "mezcla", "tierra", "vitro", "otro")
CONTENEDORES = ("maceta", "frasco_vitro", "bolsa", "bandeja", "otro")


class RegistroEvolucionCreate(BaseModel):
    fecha: Optional[date] = None
    protocolo_clonacion_id: Optional[UUID] = None
    sustrato_id: Optional[UUID] = None
    notas: Optional[str] = None
    # Morfológicas
    altura_cm: Optional[float] = None
    ancho_hoja_max_cm: Optional[float] = None
    largo_hoja_max_cm: Optional[float] = None
    num_hojas: Optional[int] = None
    num_brotes: Optional[int] = None
    num_hijuelos: Optional[int] = None
    num_nodos: Optional[int] = None
    diametro_tallo_mm: Optional[float] = None
    # Variegación
    porcentaje_variegacion: Optional[float] = None
    patron_variegacion: Optional[str] = None
    color_variegacion: Optional[str] = None
    # Contenedor
    sustrato: Optional[str] = None
    tipo_contenedor: Optional[str] = None
    diametro_contenedor_cm: Optional[float] = None
    # Condiciones ambientales
    temperatura_c: Optional[float] = None
    humedad_relativa_pct: Optional[float] = None
    humedad_sustrato_pct: Optional[float] = None
    ph_sustrato: Optional[float] = None
    luz_lux: Optional[float] = None
    conductividad_ec: Optional[float] = None
    npk: Optional[str] = None
    ppm: Optional[float] = None


class FotosRegistro(BaseModel):
    arriba: Optional[str] = None
    frente: Optional[str] = None
    atras: Optional[str] = None
    izquierda: Optional[str] = None
    derecha: Optional[str] = None


class RegistroEvolucionOut(BaseModel):
    id: UUID
    especimen_id: UUID
    registrado_por_id: UUID
    registrado_por_nombre: str
    protocolo_clonacion_id: Optional[UUID]
    protocolo_clonacion_nombre: Optional[str] = None
    fecha: datetime
    # Morfológicas
    altura_cm: Optional[float]
    ancho_hoja_max_cm: Optional[float]
    largo_hoja_max_cm: Optional[float]
    num_hojas: Optional[int]
    num_brotes: Optional[int]
    num_hijuelos: Optional[int]
    num_nodos: Optional[int]
    diametro_tallo_mm: Optional[float]
    # Variegación
    porcentaje_variegacion: Optional[float]
    patron_variegacion: Optional[str]
    color_variegacion: Optional[str]
    # Contenedor
    sustrato: Optional[str]
    sustrato_id: Optional[UUID] = None
    sustrato_nombre: Optional[str] = None
    tipo_contenedor: Optional[str]
    diametro_contenedor_cm: Optional[float]
    # Condiciones ambientales
    temperatura_c: Optional[float]
    humedad_relativa_pct: Optional[float]
    humedad_sustrato_pct: Optional[float]
    ph_sustrato: Optional[float]
    luz_lux: Optional[float]
    conductividad_ec: Optional[float]
    npk: Optional[str] = None
    ppm: Optional[float] = None
    fotos: Optional[dict[str, str]] = None
    notas: Optional[str]
    model_config = {"from_attributes": True}


# ── Wiki fetch ────────────────────────────────────────────────────────────────

class WikiResult(BaseModel):
    titulo: str
    descripcion_corta: Optional[str] = None
    extracto: Optional[str] = None
    wiki_url: Optional[str] = None
    wiki_lang: str = "es"


# ── Especie relacionados ───────────────────────────────────────────────────────

class EspecieExperimentoItem(BaseModel):
    id: UUID
    nombre: str
    estado: str
    fecha_inicio: date
    director_nombre: Optional[str] = None
    num_especimenes: int = 0
    model_config = {"from_attributes": True}


class EspecieProtocoloItem(BaseModel):
    id: UUID
    nombre: str
    tipo: str
    version: str
    estado_validacion: str
    model_config = {"from_attributes": True}


# ── Impresión ─────────────────────────────────────────────────────────────────

class ImprimirRequest(BaseModel):
    especimen_id: UUID


# ── QR Scan ───────────────────────────────────────────────────────────────────

class ScanContenedor(BaseModel):
    contenedor_uid: str
    especimenes: list[EspecimenOut]

class ScanResult(BaseModel):
    tipo: str  # "especimen" | "elemento" | "desconocido" | "lote" | "reactivo" | "sustrato" | "contenedor"
    especimen: Optional[EspecimenOut] = None
    elemento: Optional[ElementoOut] = None
    lote: Optional[Any] = None
    reactivo: Optional[Any] = None
    sustrato: Optional[Any] = None
    contenedor: Optional[ScanContenedor] = None


# ── Reactivos y Formulaciones ───────────────────────────────────────────────

class ReactivoBase(BaseModel):
    codigo_barras: Optional[str] = None
    nombre: str
    formula_quimica: Optional[str] = None
    marca: Optional[str] = None
    pureza_pct: Optional[float] = None
    concentracion_gl: Optional[float] = None
    fecha_expiracion: Optional[date] = None
    unidad_medida: str = "g"
    peligrosidad: list[str] = []
    notas: Optional[str] = None

class ReactivoCreate(ReactivoBase):
    pass

class ReactivoUpdate(BaseModel):
    codigo_barras: Optional[str] = None
    nombre: Optional[str] = None
    formula_quimica: Optional[str] = None
    marca: Optional[str] = None
    pureza_pct: Optional[float] = None
    concentracion_gl: Optional[float] = None
    fecha_expiracion: Optional[date] = None
    unidad_medida: Optional[str] = None
    peligrosidad: Optional[list[str]] = None
    notas: Optional[str] = None

class ReactivoOut(ReactivoBase):
    id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}

class ComponenteCreate(BaseModel):
    reactivo_id: Optional[UUID] = None
    formulacion_ingrediente_id: Optional[UUID] = None
    cantidad_base: float
    notas_pesaje: Optional[str] = None

class FormulacionIngredienteOut(BaseModel):
    id: UUID
    nombre: str
    unidad_medida: str = "ml" # Virtual unit for stocks
    model_config = {"from_attributes": True}

class ComponenteOut(BaseModel):
    id: UUID
    reactivo: Optional[ReactivoOut] = None
    formulacion_ingrediente: Optional[FormulacionIngredienteOut] = None
    cantidad_base: float
    notas_pesaje: Optional[str]
    model_config = {"from_attributes": True}

class FormulacionCreate(BaseModel):
    nombre: str
    codigo_referencia: Optional[str] = None
    descripcion: Optional[str] = None
    procedimiento: Optional[str] = None
    volumen_base_l: float = 1.0
    caducidad_dias: int = 30
    componentes: list[ComponenteCreate]

class FormulacionOut(BaseModel):
    id: UUID
    nombre: str
    codigo_referencia: Optional[str]
    descripcion: Optional[str]
    procedimiento: Optional[str]
    volumen_base_l: float
    caducidad_dias: int
    created_at: datetime
    componentes: list[ComponenteOut]
    model_config = {"from_attributes": True}

class LotePreparadoCreate(BaseModel):
    formulacion_id: UUID
    volumen_l: float
    concentracion_x: float = 1.0
    ph_final: Optional[float] = None
    trazabilidad_reactivos: Optional[dict[str, str]] = None
    notas: Optional[str] = None

class LotePreparadoOut(BaseModel):
    id: UUID
    uid: str
    formulacion: FormulacionOut
    preparado_por_nombre: str
    fecha_preparacion: datetime
    fecha_expiracion: Optional[datetime] = None
    volumen_l: float
    concentracion_x: float
    ph_final: Optional[float]
    trazabilidad_reactivos: Optional[dict[str, str]] = None
    estado: str
    notas: Optional[str]
    model_config = {"from_attributes": True}
