import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from jose import jwt

# Ensure tests use the correct DB (in a real scenario, override DATABASE_URL in env)
# We will use the existing DB URL but wrap tests in transactions that rollback.
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/lbms")

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.database import Base, get_db
from app.main import app
from app import models
from app.auth import get_current_user

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    yield engine

@pytest.fixture(scope="function")
def db(db_engine):
    """
    Creates a fresh SQLAlchemy session for a test and rolls back changes after.
    This ensures tests are isolated and don't pollute the database.
    """
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    """
    FastAPI TestClient that overrides the get_db dependency to use the test session.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture(scope="function")
def auth_client(client, db):
    """
    TestClient that acts as an authenticated user.
    Creates a test user and overrides the get_current_user dependency.
    """
    # Create test user
    user = db.query(models.Usuario).filter(models.Usuario.email == "test@lab.com").first()
    if not user:
        user = models.Usuario(
            nombre="Test Tech",
            email="test@lab.com",
            hashed_password="hashed_dummy_password",
            rol="tecnico",
            activo=True
        )
        db.add(user)
        db.flush()
    
    def override_get_current_user():
        return user
        
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    del app.dependency_overrides[get_current_user]

@pytest.fixture(scope="function")
def admin_client(client, db):
    """
    TestClient that acts as an admin user.
    """
    admin = db.query(models.Usuario).filter(models.Usuario.email == "admin@lab.com").first()
    if not admin:
        admin = models.Usuario(
            nombre="Admin Tech",
            email="admin@lab.com",
            hashed_password="hashed_dummy_password",
            rol="admin",
            activo=True
        )
        db.add(admin)
        db.flush()
    
    def override_get_current_user():
        return admin
        
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    del app.dependency_overrides[get_current_user]

@pytest.fixture(autouse=True)
def inject_test_user(db):
    """
    A global fixture to ensure that tests that don't explicitly use auth_client 
    still have access to a valid user in the DB if they manually create records.
    """
    user = db.query(models.Usuario).filter(models.Usuario.email == "global@lab.com").first()
    if not user:
        user = models.Usuario(
            nombre="Global Test Tech",
            email="global@lab.com",
            hashed_password="hashed_dummy_password",
            rol="tecnico",
            activo=True
        )
        db.add(user)
        db.flush()
    return user
