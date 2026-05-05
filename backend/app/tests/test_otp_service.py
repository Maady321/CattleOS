import pytest
from unittest.mock import MagicMock, patch
from app.services.otp_service import OTPService

@pytest.fixture
def mock_redis():
    with patch("app.services.otp_service.redis_client") as mock:
        yield mock

@pytest.fixture
def otp_service(mock_redis):
    service = OTPService()
    service.redis = mock_redis
    return service

def test_generate_otp(otp_service):
    otp = otp_service.generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()

def test_can_send_otp_cooldown(otp_service, mock_redis):
    email = "test@example.com"
    ip = "127.0.0.1"
    
    # Simulate cooldown active
    mock_redis.exists.return_value = True
    
    can_send, error = otp_service.can_send_otp(email, ip)
    assert can_send is False
    assert "wait" in error.lower()

def test_can_send_otp_rate_limit_email(otp_service, mock_redis):
    email = "test@example.com"
    ip = "127.0.0.1"
    
    # Simulate rate limit exceeded
    mock_redis.exists.return_value = False
    mock_redis.get.side_effect = lambda k: "10" if "rate_limit:test@example.com" in k else None
    
    can_send, error = otp_service.can_send_otp(email, ip)
    assert can_send is False
    assert "too many requests" in error.lower()

def test_store_otp(otp_service, mock_redis):
    email = "test@example.com"
    otp = "123456"
    ip = "127.0.0.1"
    
    otp_service.store_otp(email, otp, ip)
    
    # Check if hashed OTP was stored
    assert mock_redis.setex.called
    args, _ = mock_redis.setex.call_args_list[0]
    assert args[0] == f"otp:{email}"
    # Verify hash isn't plain text
    assert args[2] != otp

def test_verify_otp_success(otp_service, mock_redis):
    email = "test@example.com"
    otp = "123456"
    
    # Store a hashed version first
    from app.core.security import get_password_hash
    hashed = get_password_hash(otp)
    
    mock_redis.get.side_effect = lambda k: hashed if k == f"otp:{email}" else None
    
    is_valid, msg = otp_service.verify_otp(email, otp)
    assert is_valid is True
    assert mock_redis.delete.called

def test_verify_otp_invalid(otp_service, mock_redis):
    email = "test@example.com"
    otp = "123456"
    wrong_otp = "654321"
    
    from app.core.security import get_password_hash
    hashed = get_password_hash(otp)
    
    mock_redis.get.side_effect = lambda k: hashed if k == f"otp:{email}" else "0"
    
    is_valid, msg = otp_service.verify_otp(email, wrong_otp)
    assert is_valid is False
    assert "Invalid" in msg
    assert mock_redis.incr.called

def test_verify_otp_max_attempts(otp_service, mock_redis):
    email = "test@example.com"
    otp = "123456"
    
    mock_redis.get.side_effect = lambda k: "5" if k == f"otp_attempts:{email}" else "some_hash"
    
    is_valid, msg = otp_service.verify_otp(email, otp)
    assert is_valid is False
    assert "Too many failed attempts" in msg
    assert mock_redis.delete.called # Should delete OTP on max attempts
