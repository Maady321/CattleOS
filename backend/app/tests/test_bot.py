import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.bot_protection_service import BotProtectionService

@pytest.fixture
def bot_service():
    return BotProtectionService()

def test_calculate_bot_score_honeypot(bot_service):
    request = MagicMock()
    data = {"website_url": "http://evil-bot.com"}
    score = bot_service.calculate_bot_score(request, data)
    assert score >= 100

def test_calculate_bot_score_clean(bot_service):
    request = MagicMock()
    request.headers = {"user-agent": "Mozilla/5.0"}
    data = {"device_fingerprint": "clean_fp"}
    score = bot_service.calculate_bot_score(request, data)
    assert score == 0

@pytest.mark.asyncio
async def test_protect_blacklist(bot_service):
    request = MagicMock()
    request.client.host = "1.2.3.4"
    
    with patch.object(bot_service.redis, 'sismember', return_value=True):
        with pytest.raises(HTTPException) as exc:
            await bot_service.protect(request, {})
        assert exc.value.status_code == 403
        assert "denied" in exc.value.detail.lower()

@pytest.mark.asyncio
@patch("app.services.bot_protection_service.audit_service")
async def test_protect_bot_score(mock_audit, bot_service):
    request = MagicMock()
    request.client.host = "5.6.7.8"
    data = {"website_url": "honeypot_hit"}
    
    with patch.object(bot_service.redis, 'sismember', return_value=False):
        with patch.object(bot_service, 'check_velocity', return_value=True):
            with pytest.raises(HTTPException) as exc:
                await bot_service.protect(request, data)
            assert exc.value.status_code == 403
            assert "bot activity" in exc.value.detail.lower()
            mock_audit.log_event.assert_called_once()
