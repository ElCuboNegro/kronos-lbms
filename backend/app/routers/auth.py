import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

FOTOS_DIR = Path("/app/uploads/fotos")
FOTOS_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/login", response_model=schemas.Token)
@limiter.limit("25/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    if not user.activo:
        raise HTTPException(status_code=403, detail="Usuario inactivo")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/registro", response_model=schemas.UsuarioOut, status_code=201)
def registrar(payload: schemas.UsuarioCreate, db: Session = Depends(get_db),
              _: models.Usuario = Depends(auth.require_admin)):
    if db.query(models.Usuario).filter(models.Usuario.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email ya registrado")
    user = models.Usuario(
        nombre=payload.nombre,
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        rol=payload.rol,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=schemas.UsuarioOut)
def me(current_user: models.Usuario = Depends(auth.get_current_user)):
    return current_user


@router.put("/password", status_code=204)
def cambiar_password(
    payload: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    if not auth.verify_password(payload.password_actual, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    if len(payload.password_nuevo) < 8:
        raise HTTPException(status_code=422, detail="La nueva contraseña debe tener al menos 8 caracteres")
    current_user.hashed_password = auth.hash_password(payload.password_nuevo)
    db.commit()


@router.post("/me/foto", response_model=schemas.UsuarioOut)
def subir_foto(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Solo se aceptan JPEG, PNG o WebP")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        raise HTTPException(status_code=415, detail="Formato no permitido. Usa: jpg, jpeg, png, webp")

    dest = FOTOS_DIR / f"{current_user.id}.{ext}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    current_user.foto_url = f"/usuarios/{current_user.id}/foto"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/usuarios", response_model=list[schemas.UsuarioListItem])
def listar_usuarios(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return db.query(models.Usuario).order_by(models.Usuario.nombre).all()


@router.get("/usuarios/{id}/foto")
def foto_usuario(id: str, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    for ext in ("jpg", "jpeg", "png", "webp"):
        path = FOTOS_DIR / f"{id}.{ext}"
        if path.exists():
            return FileResponse(path)
    raise HTTPException(status_code=404, detail="Foto no encontrada")
