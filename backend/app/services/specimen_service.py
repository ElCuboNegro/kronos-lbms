from datetime import datetime
import hashlib
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas

from app.core.concurrency import ConcurrencyManager

class SpecimenService:
    @staticmethod
    def resolve_inheritance(db: Session, especie_id: str, linea_id: str = None) -> dict:
        """Resuelve la jerarquía de configuración: Especie -> Línea."""
        defaults = {}
        especie = db.query(models.Especie).filter(models.Especie.id == especie_id).first()
        if not especie:
            raise HTTPException(status_code=404, detail="Especie no encontrada")

        if especie.config_estandar:
            defaults.update(especie.config_estandar)

        if linea_id:
            linea = db.query(models.Linea).filter(models.Linea.id == linea_id).first()
            if linea and linea.config_estandar:
                defaults.update({k: v for k, v in linea.config_estandar.items() if v is not None})

        return defaults

    @staticmethod
    def _generate_uid_prefix(especie_codigo: str, especie_nombre: str) -> str:
        code = especie_codigo or especie_nombre[:4].upper()
        return f"{code}-{datetime.now().strftime('%y%m%d-%H%M%S')}-"

    @staticmethod
    def build_event_summary(eventos) -> list[schemas.EventoSummary]:
        return [
            schemas.EventoSummary(
                id=e.id,
                tipo=e.tipo,
                descripcion=e.descripcion,
                timestamp=e.timestamp,
                usuario_nombre=e.usuario.nombre,
                ejecutado_por_nombre=e.ejecutado_por.nombre if e.ejecutado_por else None,
            )
            for e in eventos
        ]

    @classmethod
    def map_to_out(cls, esp: models.Especimen) -> schemas.EspecimenOut:
        return schemas.EspecimenOut(
            id=esp.id,
            uid=esp.uid,
            especie=esp.especie,
            especie_id=esp.especie_id,
            especie_codigo=esp.especie_rel.codigo if esp.especie_rel else None,
            linea_id=esp.linea_id,
            linea_nombre=esp.linea_rel.nombre if esp.linea_rel else None,
            variegacion_id=esp.variegacion_id,
            variegacion_nombre=esp.variegacion_rel.nombre if esp.variegacion_rel else None,
            madre_id=esp.madre_id,
            madre_uid=esp.madre.uid if esp.madre else None,
            padre_id=esp.padre_id,
            padre_uid=esp.padre.uid if esp.padre else None,
            fecha_ingreso=esp.fecha_ingreso,
            origen=esp.origen,
            coordenadas=esp.coordenadas,
            estado=esp.estado,
            notas=esp.notas,
            created_at=esp.created_at,
            eventos=cls.build_event_summary(esp.eventos),
        )

    @classmethod
    def create_bulk(cls, db: Session, payload: schemas.EspecimenBulkRequest, user_id: str):
        """Lógica de creación masiva delegada al servicio con bloqueo de concurrencia abstraído."""
        defaults = cls.resolve_inheritance(db, payload.especie_id, payload.linea_id)
        especie_obj = db.query(models.Especie).filter(models.Especie.id == payload.especie_id).first()

        prefix = cls._generate_uid_prefix(especie_obj.codigo, especie_obj.nombre_cientifico)
        cm = ConcurrencyManager(db)

        especimenes = []
        # Bloqueamos el prefijo para toda la operación de creación masiva
        with cm.transactional_lock(f"bulk_create_{prefix}"):
            # Obtener el último índice una sola vez bajo el lock
            ultimo = db.query(models.Especimen).filter(
                models.Especimen.uid.like(f"{prefix}%")
            ).order_by(models.Especimen.indice.desc().nullslast()).first()

            start_idx = (ultimo.indice + 1) if (ultimo and ultimo.indice is not None) else 1

            current_global_idx = start_idx
            for item in payload.items:
                for _ in range(item.cantidad):
                    esp = models.Especimen(
                        uid=f"{prefix}{current_global_idx:03d}",
                        indice=current_global_idx,
                        especie=especie_obj.nombre_cientifico,
                        especie_id=payload.especie_id,
                        linea_id=payload.linea_id,
                        variegacion_id=payload.variegacion_id,
                        madre_id=payload.madre_id,
                        padre_id=payload.padre_id,
                        contenedor_uid=payload.contenedor_uid,
                        estado=payload.estado,
                        fecha_ingreso=payload.fecha_ingreso,
                        origen=payload.origen,
                        coordenadas=payload.coordenadas,
                        notas=item.notas,
                        **defaults
                    )
                    db.add(esp)
                    especimenes.append(esp)
                    current_global_idx += 1

            db.commit()

        return [cls.map_to_out(e) for e in especimenes]
