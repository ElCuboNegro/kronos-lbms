import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, Date,
    Float, ForeignKey, Integer, Table
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


# ── Association tables ────────────────────────────────────────────────────────

experimento_especimen = Table(
    "experimento_especimen", Base.metadata,
    Column("experimento_id", UUID(as_uuid=True), ForeignKey("experimentos.id"), primary_key=True),
    Column("especimen_id", UUID(as_uuid=True), ForeignKey("especimenes.id"), primary_key=True),
    Column("rol", String(50), nullable=True),  # fuente, objetivo, control, testigo
)

experimento_elemento = Table(
    "experimento_elemento", Base.metadata,
    Column("experimento_id", UUID(as_uuid=True), ForeignKey("experimentos.id"), primary_key=True),
    Column("elemento_id", UUID(as_uuid=True), ForeignKey("elementos.id"), primary_key=True),
)


# ── Core ──────────────────────────────────────────────────────────────────────

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    rol = Column(String(20), nullable=False, default="tecnico")  # admin, tecnico, observador
    activo = Column(Boolean, default=True)
    foto_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    eventos_registrados = relationship("Evento", foreign_keys="Evento.usuario_id", back_populates="usuario")
    eventos_ejecutados = relationship("Evento", foreign_keys="Evento.ejecutado_por_id", back_populates="ejecutado_por")


class Especie(Base):
    __tablename__ = "especies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo = Column(String(10), unique=True, nullable=True) # Se hará obligatorio en la lógica
    nombre_cientifico = Column(String(255), unique=True, nullable=False, index=True)
    categoria = Column(String(30), nullable=False, default="especie")
    # especie, subespecie, sp, cultivar
    nombre_comun = Column(String(255), nullable=True)
    familia = Column(String(100), nullable=True)
    genero = Column(String(100), nullable=True)
    descripcion = Column(Text, nullable=True)
    requerimientos = Column(JSONB, nullable=True)
    config_estandar = Column(JSONB, nullable=True, default=dict)
    ficha = Column(JSONB, nullable=True)
  # ciclo_vida, maduracion, wiki_url, wiki_lang, wiki_fetched_at
    created_at = Column(DateTime, default=datetime.utcnow)

    lineas = relationship("Linea", back_populates="especie", order_by="Linea.nombre")
    especimenes = relationship("Especimen", back_populates="especie_rel")


class Linea(Base):
    __tablename__ = "lineas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    especie_id = Column(UUID(as_uuid=True), ForeignKey("especies.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    metodo_propagacion = Column(String(50), nullable=False, default="desconocido")
    # semilla, clonacion, mutacion_in_vitro, desconocido
    descripcion = Column(Text, nullable=True)
    config_estandar = Column(JSONB, nullable=True, default=dict)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    especie = relationship("Especie", back_populates="lineas")
    variegaciones = relationship("Variegacion", back_populates="linea", order_by="Variegacion.nombre")
    especimenes = relationship("Especimen", back_populates="linea_rel")


class Variegacion(Base):
    __tablename__ = "variegaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    linea_id = Column(UUID(as_uuid=True), ForeignKey("lineas.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    codigo = Column(String(10), nullable=True) # ej: ALBO, MINT
    descripcion = Column(Text, nullable=True)
    config_estandar = Column(JSONB, nullable=True, default=dict)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    linea = relationship("Linea", back_populates="variegaciones")
    especimenes = relationship("Especimen", back_populates="variegacion_rel")


class Especimen(Base):
    __tablename__ = "especimenes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uid = Column(String(100), unique=True, nullable=False, index=True)
    especie = Column(String(255), nullable=False)  # texto libre para compatibilidad QR
    especie_id = Column(UUID(as_uuid=True), ForeignKey("especies.id"), nullable=True, index=True)
    linea_id = Column(UUID(as_uuid=True), ForeignKey("lineas.id"), nullable=True, index=True)
    variegacion_id = Column(UUID(as_uuid=True), ForeignKey("variegaciones.id"), nullable=True, index=True)
    madre_id = Column(UUID(as_uuid=True), ForeignKey("especimenes.id"), nullable=True)
    padre_id = Column(UUID(as_uuid=True), ForeignKey("especimenes.id"), nullable=True)
    fecha_ingreso = Column(Date, nullable=False, default=date.today)
    origen = Column(String(255), nullable=True)
    coordenadas = Column(JSONB, nullable=True)
    indice = Column(Integer, nullable=True) # Para generación de UID secuencial
    estado = Column(String(30), nullable=False, default="activo")
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    especie_rel = relationship("Especie", back_populates="especimenes")
    linea_rel = relationship("Linea", back_populates="especimenes")
    variegacion_rel = relationship("Variegacion", back_populates="especimenes")

    madre = relationship("Especimen", remote_side=[id], foreign_keys=[madre_id], backref="hijos_madre")
    padre = relationship("Especimen", remote_side=[id], foreign_keys=[padre_id], backref="hijos_padre")

    eventos = relationship("Evento", foreign_keys="Evento.especimen_id", back_populates="especimen",
                           order_by="Evento.timestamp.desc()")
    experimentos = relationship("Experimento", secondary=experimento_especimen, back_populates="especimenes")
    registros_evolucion = relationship("RegistroEvolucion", back_populates="especimen",
                                       order_by="RegistroEvolucion.fecha.desc()")


class Elemento(Base):
    __tablename__ = "elementos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    element_id = Column(String(100), unique=True, nullable=False, index=True)
    tipo = Column(String(100), nullable=False)
    descripcion = Column(String(500), nullable=False)
    cantidad = Column(Float, nullable=True)
    unidad = Column(String(30), nullable=True)
    estado = Column(String(30), nullable=False, default="activo")
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    eventos = relationship("Evento", foreign_keys="Evento.elemento_id", back_populates="elemento",
                           order_by="Evento.timestamp.desc()")
    experimentos = relationship("Experimento", secondary=experimento_elemento, back_populates="elementos")


# ── Protocolo ─────────────────────────────────────────────────────────────────

class Protocolo(Base):
    __tablename__ = "protocolos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    version = Column(String(20), nullable=False, default="1.0")
    descripcion = Column(Text, nullable=True)
    pasos = Column(JSONB, nullable=False, default=list)
    materiales = Column(JSONB, nullable=True, default=list)
    estado_validacion = Column(String(30), nullable=False, default="borrador")
    creado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creado_por = relationship("Usuario")
    validaciones = relationship("ValidacionProtocolo", back_populates="protocolo",
                                order_by="ValidacionProtocolo.fecha.desc()")
    experimentos = relationship("Experimento", back_populates="protocolo")


class ValidacionProtocolo(Base):
    __tablename__ = "validaciones_protocolo"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protocolo_id = Column(UUID(as_uuid=True), ForeignKey("protocolos.id"), nullable=False, index=True)
    experimento_id = Column(UUID(as_uuid=True), ForeignKey("experimentos.id"), nullable=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    resultado = Column(String(20), nullable=False)
    observaciones = Column(Text, nullable=False)
    metricas = Column(JSONB, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow)

    protocolo = relationship("Protocolo", back_populates="validaciones")
    usuario = relationship("Usuario")


# ── Experimento ───────────────────────────────────────────────────────────────

class Experimento(Base):
    __tablename__ = "experimentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    hipotesis = Column(Text, nullable=True)
    protocolo_id = Column(UUID(as_uuid=True), ForeignKey("protocolos.id"), nullable=True)
    fecha_inicio = Column(Date, nullable=False, default=date.today)
    fecha_fin = Column(Date, nullable=True)
    estado = Column(String(30), nullable=False, default="activo")
    # planificado, activo, pausado, completado, cancelado
    director_id = Column("director_id", UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    operador_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    
    # ── Enfoque del experimento (Opcionales)
    especie_id = Column(UUID(as_uuid=True), ForeignKey("especies.id"), nullable=True)
    linea_id = Column(UUID(as_uuid=True), ForeignKey("lineas.id"), nullable=True)
    variegacion_id = Column(UUID(as_uuid=True), ForeignKey("variegaciones.id"), nullable=True)
    
    config_estandar = Column(JSONB, nullable=True, default=dict)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    protocolo = relationship("Protocolo", back_populates="experimentos")
    director = relationship("Usuario", foreign_keys=[director_id])
    operador = relationship("Usuario", foreign_keys=[operador_id])
    especimenes = relationship("Especimen", secondary=experimento_especimen, back_populates="experimentos")
    elementos = relationship("Elemento", secondary=experimento_elemento, back_populates="experimentos")
    resultados = relationship("ResultadoInvestigacion", back_populates="experimento",
                              order_by="ResultadoInvestigacion.fecha.desc()")
    eventos = relationship("Evento", foreign_keys="Evento.experimento_id", back_populates="experimento")


# ── Resultado de investigación ────────────────────────────────────────────────

class ResultadoInvestigacion(Base):
    __tablename__ = "resultados_investigacion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experimento_id = Column(UUID(as_uuid=True), ForeignKey("experimentos.id"), nullable=False, index=True)
    titulo = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=False)
    datos = Column(JSONB, nullable=True)
    archivos = Column(JSONB, nullable=True)
    registrado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)

    experimento = relationship("Experimento", back_populates="resultados")
    registrado_por = relationship("Usuario")


# ── Evento ────────────────────────────────────────────────────────────────────

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo = Column(String(50), nullable=False)
    # siembra, transferencia, contaminacion, observacion, cosecha,
    # entrada, salida, sanitizacion, inicio_experimento, fin_experimento, otro
    descripcion = Column(Text, nullable=False)
    especimen_id = Column(UUID(as_uuid=True), ForeignKey("especimenes.id"), nullable=True, index=True)
    elemento_id = Column(UUID(as_uuid=True), ForeignKey("elementos.id"), nullable=True, index=True)
    experimento_id = Column(UUID(as_uuid=True), ForeignKey("experimentos.id"), nullable=True, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    ejecutado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    meta = Column(JSONB, nullable=True)

    especimen = relationship("Especimen", foreign_keys=[especimen_id], back_populates="eventos")
    elemento = relationship("Elemento", foreign_keys=[elemento_id], back_populates="eventos")
    experimento = relationship("Experimento", foreign_keys=[experimento_id], back_populates="eventos")
    usuario = relationship("Usuario", foreign_keys=[usuario_id], back_populates="eventos_registrados")
    ejecutado_por = relationship("Usuario", foreign_keys=[ejecutado_por_id], back_populates="eventos_ejecutados")


# ── Registro de Evolución ─────────────────────────────────────────────────────

ANGULOS = ("arriba", "frente", "atras", "izquierda", "derecha")


class Sustrato(Base):
    __tablename__ = "sustratos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo_formulacion = Column(String(50), unique=True, nullable=False)
    tipo = Column(String(50), nullable=False, default="sustrato")
    # sustrato, agar, mezcla, otro
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    componentes = Column(JSONB, nullable=True)
    ph_teorico = Column(Float, nullable=True)
    conductividad_teorica = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RegistroEvolucion(Base):
    __tablename__ = "registros_evolucion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    especimen_id = Column(UUID(as_uuid=True), ForeignKey("especimenes.id"), nullable=False, index=True)
    registrado_por_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    protocolo_clonacion_id = Column(UUID(as_uuid=True), ForeignKey("protocolos.id"), nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)

    # ── Morfológicas
    altura_cm = Column(Float, nullable=True)
    ancho_hoja_max_cm = Column(Float, nullable=True)
    largo_hoja_max_cm = Column(Float, nullable=True)
    num_hojas = Column(Integer, nullable=True)
    num_brotes = Column(Integer, nullable=True)
    num_hijuelos = Column(Integer, nullable=True)
    num_nodos = Column(Integer, nullable=True)
    diametro_tallo_mm = Column(Float, nullable=True)

    # ── Variegación
    porcentaje_variegacion = Column(Float, nullable=True)
    patron_variegacion = Column(String(50), nullable=True)
    # sector, half_moon, moteado, marble, full, none
    color_variegacion = Column(String(50), nullable=True)
    # blanco, crema, amarillo, mint, none

    # ── Contenedor / sustrato
    sustrato = Column(String(100), nullable=True)
    # akadama, sphagnum, perlita, mezcla, tierra, vitro, otro
    sustrato_id = Column(UUID(as_uuid=True), ForeignKey("sustratos.id"), nullable=True)
    tipo_contenedor = Column(String(50), nullable=True)
    # maceta, frasco_vitro, bolsa, bandeja, otro
    diametro_contenedor_cm = Column(Float, nullable=True)

    # ── Condiciones ambientales
    temperatura_c = Column(Float, nullable=True)
    humedad_relativa_pct = Column(Float, nullable=True)
    humedad_sustrato_pct = Column(Float, nullable=True)
    ph_sustrato = Column(Float, nullable=True)
    luz_lux = Column(Float, nullable=True)
    conductividad_ec = Column(Float, nullable=True)
    npk = Column(String(50), nullable=True)
    ppm = Column(Float, nullable=True)

    # ── Fotos: {arriba: ruta, frente: ruta, atras: ruta, izquierda: ruta, derecha: ruta}
    fotos = Column(JSONB, nullable=True, default=dict)
    notas = Column(Text, nullable=True)

    especimen = relationship("Especimen", back_populates="registros_evolucion")
    registrado_por = relationship("Usuario")
    sustrato_rel = relationship("Sustrato")
    protocolo_clonacion = relationship("Protocolo")
