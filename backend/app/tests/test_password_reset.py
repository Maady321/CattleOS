import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.password_reset_service import PasswordResetService

@pytest.fixture
def reset_service():
    return PasswordResetService()

@pytest.mark.asyncio
async def test_initiate_reset_rate_limit(reset_service):
    db = MagicMock()
    request = MagicMock()
    email = "test@example.com"
    
    with patch.object(reset_service.redis, 'incr', return_value=4): # Exceeds 3
        # Should return None (silently fail)
        result = await reset_service.initiate_reset(db, email, request)
        assert result is None

@pytest.mark.asyncio
async def test_confirm_reset_invalid_token(reset_service):
    db = MagicMock()
    request = MagicMock()
    raw_token = "invalid_token"
    
    with patch.object(reset_service.redis, 'get', return_value=None):
        with pytest.raises(HTTPException) as exc:
            await reset_service.confirm_reset(db, raw_token, "new_pass", request)
        assert exc.value.status_code == 400
        assert "invalid or expired" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_confirm_reset_success(reset_service):
    db = MagicMock()
    request = MagicMock()
    raw_token = "valid_token"
    user_id = "user_123"
    user = MagicMock()
    user.id = user_id
    
    with patch("app.services.password_reset_service.user_service") as mock_user_service:
        mock_user_service.get_by_id.return_value = user
        with patch("app.services.session_service.SessionService.logout_all") as mock_logout_all:
            with patch.object(reset_service, 'redis') as mock_redis:
                mock_redis.get.return_value = user_id.encode()
                mock_redis.delete.return_value = 1
                
                result = await reset_service.confirm_reset(db, raw_token, "new_pass", request)
                
                assert "success" in result["message"].lower()
                mock_user_service.update.assert_called_once()
                mock_logout_all.assert_called_once()
                mock_user_service.get_by_id.assert_called_once()
