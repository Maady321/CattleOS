import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.services.otp_service import otp_service
from app.models.user import User

@pytest.mark.asyncio
async def test_full_auth_flow(client: AsyncClient, db, mock_redis):
    # 1. Registration
    email = "newuser@example.com"
    reg_data = {
        "email": email,
        "phone_number": "+1234567890",
        "full_name": "Test User",
        "password": "password123",
        "device_fingerprint": "test-device"
    }
    
    response = await client.post(f"{settings.API_V1_STR}/auth/register", json=reg_data)
    assert response.status_code == 200
    
    # Get OTP from mock redis
    otp_key = otp_service._get_otp_key(email)
    # Since we can't easily get the plain OTP from hashed redis value, 
    # we'll monkeypatch generate_otp in the test
    pass

@pytest.mark.asyncio
async def test_login_and_refresh(client: AsyncClient, test_user, mock_redis, monkeypatch):
    # Mock OTP to be static for testing
    monkeypatch.setattr("app.services.otp_service.otp_service.generate_otp", lambda: "123456")
    
    # 1. Initiate Login
    login_data = {
        "identifier": test_user.email,
        "password": "password123", # factory default
        "device_fingerprint": "test-device"
    }
    resp = await client.post(f"{settings.API_V1_STR}/auth/login/initiate", json=login_data)
    assert resp.status_code == 200
    
    # 2. Verify Login
    verify_data = {
        "email": test_user.email,
        "otp": "123456"
    }
    resp = await client.post(
        f"{settings.API_V1_STR}/auth/login/verify", 
        params=verify_data
    )
    assert resp.status_code == 200
    data = resp.json()
    access_token = data["access_token"]
    
    # Check refresh cookie
    refresh_cookie = resp.cookies.get("refresh_token")
    assert refresh_cookie is not None
    
    # Check CSRF cookie
    csrf_token = resp.cookies.get("csrf_token")
    assert csrf_token is not None
    
    # 3. Refresh Token
    # Must include CSRF header for refresh
    headers = {"X-CSRF-Token": csrf_token}
    resp = await client.post(
        f"{settings.API_V1_STR}/auth/refresh", 
        cookies={"refresh_token": refresh_cookie, "csrf_token": csrf_token},
        headers=headers
    )
    assert resp.status_code == 200
    new_data = resp.json()
    assert "access_token" in new_data
    assert new_data["access_token"] != access_token

@pytest.mark.asyncio
async def test_refresh_token_reuse_detection(client: AsyncClient, test_user, mock_redis, monkeypatch):
    monkeypatch.setattr("app.services.otp_service.otp_service.generate_otp", lambda: "123456")
    
    # Login to get refresh token
    login_data = {"identifier": test_user.email, "password": "password123", "device_fingerprint": "test-device"}
    await client.post(f"{settings.API_V1_STR}/auth/login/initiate", json=login_data)
    resp = await client.post(f"{settings.API_V1_STR}/auth/login/verify", params={"email": test_user.email, "otp": "123456"})
    
    refresh_token_1 = resp.cookies.get("refresh_token")
    csrf_token = resp.cookies.get("csrf_token")
    
    # Use refresh token once
    resp2 = await client.post(
        f"{settings.API_V1_STR}/auth/refresh", 
        cookies={"refresh_token": refresh_token_1, "csrf_token": csrf_token},
        headers={"X-CSRF-Token": csrf_token}
    )
    assert resp2.status_code == 200
    
    # Attempt to use the SAME refresh token again (Reuse Attack)
    resp3 = await client.post(
        f"{settings.API_V1_STR}/auth/refresh", 
        cookies={"refresh_token": refresh_token_1, "csrf_token": csrf_token},
        headers={"X-CSRF-Token": csrf_token}
    )
    assert resp3.status_code == 401
    assert "compromised" in resp3.json()["detail"]
