from sqlalchemy import text
from app.database import SessionLocal
from app import models

def sanitize():
    db = SessionLocal()
    # Buscar especímenes con índice nulo
    especimenes = db.query(models.Especimen).filter(models.Especimen.indice == None).all()
    print(f"Saneando {len(especimenes)} especímenes...")

    for esp in especimenes:
        try:
            # Extraer índice del final del UID (ej: TST-240507-123456-001 -> 1)
            esp.indice = int(esp.uid.split("-")[-1])
        except (ValueError, IndexError):
            esp.indice = 1

    db.commit()
    print("Saneamiento completado.")

if __name__ == "__main__":
    sanitize()
