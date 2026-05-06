import asyncio
import pytest
import time
from httpx import AsyncClient
from app.tests.factories import UserFactory

@pytest.mark.asyncio
async def test_concurrent_refresh_requests(client, test_user, monkeypatch):
    """Simulate race conditions in token rotation."""
    monkeypatch.setattr("app.services.otp_service.otp_service.generate_otp", lambda: "123456")
    
    # Login to get refresh token
    login_data = {"identifier": test_user.email, "password": "password123", "device_fingerprint": "fp"}
    await client.post("/api/v1/auth/login/initiate", json=login_data)
    resp = await client.post("/api/v1/auth/login/verify", params={"email": test_user.email, "otp": "123456"})
    
    refresh_token = resp.cookies.get("refresh_token")
    csrf_token = resp.cookies.get("csrf_token")
    
    # Fire 5 concurrent refresh requests with the same token
    tasks = [
        client.post(
            "/api/v1/auth/refresh",
            cookies={"refresh_token": refresh_token, "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token}
        )
        for _ in range(5)
    ]
    
    results = await asyncio.gather(*tasks)
    
    # At most one should succeed, others might fail with 401 (compromised) 
    # depending on how fast the first one revokes the JTI.
    successes = [r for r in results if r.status_code == 200]
    assert len(successes) <= 1

@pytest.mark.asyncio
async def test_otp_flood_load(client):
    """Simulate high volume of OTP requests."""
    start_time = time.time()
    tasks = [
        client.post(
            "/api/v1/auth/login/initiate",
            json={"identifier": f"user{i}@test.com", "password": "pwd", "device_fingerprint": "fp"}
        )
        for i in range(50)
    ]
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    
    print(f"Time taken for 50 requests: {end_time - start_time:.2f}s")
    # We expect many to be rate limited (429) or succeed (200) but the system should handle the load
    assert all(r.status_code in [200, 429, 400] for r in results)
