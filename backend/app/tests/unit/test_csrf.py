import pytest
from app.services.csrf_service import csrf_service
from fastapi import Request
from unittest.mock import MagicMock

def test_csrf_token_generation():
    token = csrf_service.generate_token()
    assert len(token) >= 32
    assert isinstance(token, str)

@pytest.mark.asyncio
async def test_csrf_validation_success():
    token = csrf_service.generate_token()
    
    # Mock request with correct cookie and header
    request = MagicMock(spec=Request)
    request.cookies = {"csrf_token": token}
    request.headers = {"X-CSRF-Token": token}
    request.method = "POST"
    
    # Should not raise exception
    await csrf_service.validate_csrf(request)

@pytest.mark.asyncio
async def test_csrf_validation_mismatch():
    token1 = csrf_service.generate_token()
    token2 = csrf_service.generate_token()
    
    request = MagicMock(spec=Request)
    request.cookies = {"csrf_token": token1}
    request.headers = {"X-CSRF-Token": token2}
    request.method = "POST"
    
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        await csrf_service.validate_csrf(request)
    assert exc.value.status_code == 403
