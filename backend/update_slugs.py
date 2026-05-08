import re
import unicodedata
from app.database import SessionLocal
from app import models

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)[:45]

db = SessionLocal()

exps = db.query(models.Experimento).filter(models.Experimento.codigo == None).all()
for e in exps:
    slug = slugify(e.nombre)
    count = db.query(models.Experimento).filter(models.Experimento.codigo.like(f"{slug}%")).count()
    if count > 0:
        slug = f"{slug}-{count+1}"
    e.codigo = slug

protos = db.query(models.Protocolo).filter(models.Protocolo.codigo == None).all()
for p in protos:
    slug = slugify(p.nombre)
    count = db.query(models.Protocolo).filter(models.Protocolo.codigo.like(f"{slug}%")).count()
    if count > 0:
        slug = f"{slug}-{count+1}"
    p.codigo = slug

db.commit()
print("✅ Slugs actualizados.")
