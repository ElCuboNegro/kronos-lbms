"""Corre dentro del contenedor para crear el primer usuario admin.
Uso: docker compose exec backend python create_admin.py
"""
import os, sys
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import Usuario
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

email = os.environ.get("ADMIN_EMAIL", "admin@kronos.lab")
password = os.environ.get("ADMIN_PASSWORD", "changeme123")
nombre = os.environ.get("ADMIN_NOMBRE", "Administrador")

with SessionLocal() as db:
    if db.query(Usuario).filter(Usuario.email == email).first():
        print(f"Usuario '{email}' ya existe.")
        sys.exit(0)
    user = Usuario(nombre=nombre, email=email, hashed_password=hash_password(password), rol="admin")
    db.add(user)
    db.commit()
    print(f"Admin creado: {email} / {password}")
