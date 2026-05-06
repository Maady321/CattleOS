import asyncio
import pytest
from typing import Generator, AsyncGenerator, Dict
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.db.base_class import Base
from app.db.session import get_db
from app.main import app
from app.core.config import settings
from app.core.security import create_access_token
from app.tests.factories import UserFactory, FarmFactory, FarmMembershipFactory
import fakeredis

# Force test environment
settings.ENVIRONMENT = "test"

# Use the configured DB but we'll use a transaction for isolation
# In a real CI, you'd use a separate DB
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db() -> Generator:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Configure factories to use this session
    UserFactory._meta.sqlalchemy_session = session
    FarmFactory._meta.sqlalchemy_session = session
    FarmMembershipFactory._meta.sqlalchemy_session = session
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
async def client(db: Session) -> AsyncGenerator:
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
def mock_redis(monkeypatch):
    fake_r = fakeredis.FakeRedis(decode_responses=True)
    monkeypatch.setattr("app.core.redis.redis_client", fake_r)
    # Also patch the service instance if it was already imported
    monkeypatch.setattr("app.services.otp_service.redis_client", fake_r)
    monkeypatch.setattr("app.services.security_service.redis_client", fake_r)
    monkeypatch.setattr("app.services.session_service.redis_client", fake_r)
    return fake_r

@pytest.fixture
def test_user(db: Session) -> UserFactory:
    return UserFactory()

@pytest.fixture
def auth_headers(test_user) -> Dict[str, str]:
    # In this system, we need a family_id for the token
    import uuid
    family_id = uuid.uuid4()
    token = create_access_token(test_user.id, family_id)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def csrf_token():
    from app.services.csrf_service import csrf_service
    return csrf_service.generate_token()
