from typing import Dict
from httpx import AsyncClient
from app.core.security import create_access_token
import uuid

def get_auth_headers(user_id: uuid.UUID) -> Dict[str, str]:
    family_id = uuid.uuid4()
    token = create_access_token(user_id, family_id)
    return {"Authorization": f"Bearer {token}"}

async def login_user(client: AsyncClient, email: str, password: str, otp: str = "123456"):
    """Helper to perform full login in tests."""
    await client.post("/api/v1/auth/login/initiate", json={
        "identifier": email, 
        "password": password,
        "device_fingerprint": "test-device"
    })
    resp = await client.post("/api/v1/auth/login/verify", params={
        "email": email,
        "otp": otp
    })
    return resp
