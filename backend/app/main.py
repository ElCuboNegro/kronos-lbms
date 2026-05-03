from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base, get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.limiter import limiter
from app.routers import auth as auth_router, especimenes, elementos, eventos, scan, especies, protocolos, experimentos, evolucion, printer, sustratos, reactivos
from fastapi import Depends
from app import models, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Base.metadata.create_all is now managed via Alembic migrations.
    # Run `alembic upgrade head` to apply schema changes.
    yield


app = FastAPI(title="Seymour-OS API", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

import os

ALLOWED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:8081",
    "http://localhost:5173",
    "https://lbms.kronosb.com",
    "http://lbms.kronosb.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$|^capacitor://localhost$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(especies.router)
app.include_router(especimenes.router)
app.include_router(elementos.router)
app.include_router(protocolos.router)
app.include_router(experimentos.router)
app.include_router(eventos.router)
app.include_router(evolucion.router)
app.include_router(printer.router)
app.include_router(scan.router)
app.include_router(sustratos.router)
app.include_router(reactivos.router)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/app/release-info")
def release_info():
    # En el futuro esto puede venir de una DB o archivo de configuración
    return {
        "version": "1.1.0",
        "required": False,
        "url": "https://github.com/ElCuboNegro/kronos-lbms/releases/latest",
        "notes": "Actualización Mayor 1.1.0: Seymour OS, Telemetría, UI Consolidada, Lector Reactivos (PubChem) y App Nativa."
    }

@app.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return {
        "especies": db.query(func.count(models.Especie.id)).scalar(),
        "individuos": db.query(func.count(models.Especimen.id)).scalar(),
        "experimentos_activos": db.query(func.count(models.Experimento.id))
                                  .filter(models.Experimento.estado == "activo").scalar(),
        "protocolos": db.query(func.count(models.Protocolo.id)).scalar(),
    }
