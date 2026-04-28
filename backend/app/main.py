from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, especimenes, elementos, eventos, scan, especies, protocolos, experimentos, evolucion, printer, sustratos, reactivos


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="LBMS API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
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
