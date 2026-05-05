import pytest
from fastapi import HTTPException
from unittest.mock import MagicMock
from app.services.csrf_service import CSRFService

@pytest.fixture
def csrf_service():
    return CSRFService()

@pytest.mark.asyncio
async def test_validate_csrf_success(csrf_service):
    token = "test_token"
    request = MagicMock()
    request.method = "POST"
    request.cookies = {"csrf_token": token}
    request.headers = {"X-CSRF-Token": token}
    
    # Should not raise exception
    await csrf_service.validate_csrf(request)

@pytest.mark.asyncio
async def test_validate_csrf_mismatch(csrf_service):
    request = MagicMock()
    request.method = "POST"
    request.cookies = {"csrf_token": "token1"}
    request.headers = {"X-CSRF-Token": "token2"}
    
    with pytest.raises(HTTPException) as exc:
        await csrf_service.validate_csrf(request)
    assert exc.value.status_code == 403
    assert "mismatch" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_validate_csrf_missing(csrf_service):
    request = MagicMock()
    request.method = "POST"
    request.cookies = {}
    request.headers = {}
    
    with pytest.raises(HTTPException) as exc:
        await csrf_service.validate_csrf(request)
    assert exc.value.status_code == 403
    assert "missing" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_validate_csrf_safe_methods(csrf_service):
    request = MagicMock()
    request.method = "GET"
    request.cookies = {}
    request.headers = {}
    
    # Should not raise exception even if tokens are missing
    await csrf_service.validate_csrf(request)
