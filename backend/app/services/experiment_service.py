from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException
from itertools import product
import re
from unicodedata import normalize

class ExperimentService:
    @staticmethod
    def slugify(text: str) -> str:
        text = normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8').lower()
        return re.sub(r'[^a-z0-9]+', '-', text).strip('-')

    @classmethod
    def create_experiment(cls, db: Session, payload: schemas.ExperimentoCreate, director_id: str):
        codigo = payload.codigo or cls.slugify(payload.nombre)

        # Verificar duplicado de código
        if db.query(models.Experimento).filter(models.Experimento.codigo == codigo).first():
            if not payload.codigo: # Si fue autogenerado, añadir sufijo
                from datetime import date
                codigo = f"{codigo}-{date.today().strftime('%y%m%d')}"
            else:
                raise HTTPException(status_code=400, detail="El código del experimento ya existe")

        data = payload.model_dump(exclude={"especimen_ids", "elemento_ids", "director_id", "codigo"})
        exp = models.Experimento(**data, director_id=director_id, codigo=codigo)
        db.add(exp)
        db.flush()

        # Vinculación Atómica de sujetos existentes
        if payload.especimen_ids:
            especimenes = db.query(models.Especimen).filter(models.Especimen.id.in_(payload.especimen_ids)).all()
            for esp in especimenes:
                if exp not in esp.experimentos:
                    esp.experimentos.append(exp)
                    if esp.estado == "activo":
                        esp.estado = "en_experimento"

        db.commit()
        db.refresh(exp)
        return exp

    @classmethod
    def generar_tratamientos(cls, db: Session, experimento_id) -> list:
        exp = db.query(models.Experimento).filter(
            models.Experimento.id == experimento_id).first()
        if not exp:
            raise HTTPException(status_code=404, detail="Experimento no encontrado")

        factores = db.query(models.Factor).filter(
            models.Factor.experimento_id == experimento_id).all()
        if not factores:
            raise HTTPException(status_code=400,
                                detail="El experimento no tiene factores definidos")

        niveles_por_factor = []
        for f in factores:
            if not f.niveles:
                raise HTTPException(status_code=400,
                                    detail=f"El factor '{f.nombre}' no tiene niveles")
            niveles_por_factor.append(list(f.niveles))

        creados = []
        for i, combo in enumerate(product(*niveles_por_factor), start=1):
            nombre = " · ".join(f"{n.factor.nombre}={n.etiqueta}" for n in combo)
            trat = models.Tratamiento(
                experimento_id=experimento_id, codigo=f"T{i}",
                nombre=nombre, es_control=False)
            trat.niveles = list(combo)
            db.add(trat)
            creados.append(trat)

        db.commit()
        for t in creados:
            db.refresh(t)
        return creados
