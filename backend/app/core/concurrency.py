import hashlib
from contextlib import contextmanager
from sqlalchemy import text
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

class LockProvider:
    """Interface base para proveedores de bloqueos."""
    def acquire(self, key: str, timeout: int = 10):
        raise NotImplementedError

    def release(self, key: str):
        raise NotImplementedError

class PostgresAdvisoryLockProvider(LockProvider):
    """Implementación de bloqueos usando Advisory Locks de PostgreSQL."""
    def __init__(self, db: Session):
        self.db = db

    def _generate_int_key(self, key: str) -> int:
        # PostgreSQL advisory locks requieren un entero de 64 bits (o dos de 32)
        # Usamos MD5 para generar un hash determinista y tomamos los primeros 8 bytes
        return int(hashlib.md5(key.encode()).hexdigest()[:15], 16)

    @contextmanager
    def lock(self, key: str):
        int_key = self._generate_int_key(key)
        try:
            logger.debug(f"Adquiriendo pg_advisory_xact_lock para clave: {key} ({int_key})")
            self.db.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": int_key})
            yield
        finally:
            # En xact_lock, el bloqueo se libera automáticamente al terminar la transacción.
            # No se requiere release manual explícito, pero la interfaz lo permite.
            pass

class ConcurrencyManager:
    """Orquestador de concurrencia agnóstico al proveedor."""
    def __init__(self, db: Session):
        self.provider = PostgresAdvisoryLockProvider(db)

    @contextmanager
    def transactional_lock(self, resource_name: str):
        """Context manager para bloquear un recurso durante la transacción actual."""
        with self.provider.lock(resource_name):
            yield
