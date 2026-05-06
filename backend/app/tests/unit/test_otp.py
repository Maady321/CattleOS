import pytest
from app.services.otp_service import otp_service
from app.core.config import settings

def test_generate_otp():
    otp = otp_service.generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()

def test_store_and_verify_otp(mock_redis):
    email = "test@example.com"
    ip = "127.0.0.1"
    otp = otp_service.generate_otp()
    
    otp_service.store_otp(email, otp, ip)
    
    # Verify success
    is_valid, message = otp_service.verify_otp(email, otp)
    assert is_valid is True
    assert message == "Verification successful"
    
    # OTP should be deleted after success
    is_valid, _ = otp_service.verify_otp(email, otp)
    assert is_valid is False

def test_otp_max_attempts(mock_redis):
    email = "test@example.com"
    ip = "127.0.0.1"
    otp = "123456"
    wrong_otp = "000000"
    
    otp_service.store_otp(email, otp, ip)
    
    # Fail max_attempts times
    for _ in range(settings.OTP_MAX_ATTEMPTS):
        is_valid, _ = otp_service.verify_otp(email, wrong_otp)
        assert is_valid is False
        
    # Next attempt (even if correct) should fail because it was deleted
    is_valid, message = otp_service.verify_otp(email, otp)
    assert is_valid is False
    assert "Too many failed attempts" in message

def test_otp_cooldown(mock_redis):
    email = "test@example.com"
    ip = "127.0.0.1"
    
    can_send, _ = otp_service.can_send_otp(email, ip)
    assert can_send is True
    
    otp_service.store_otp(email, "123456", ip)
    
    can_send, message = otp_service.can_send_otp(email, ip)
    assert can_send is False
    assert "wait" in message.lower()

def test_otp_rate_limit(mock_redis):
    email = "flood@example.com"
    ip = "1.2.3.4"
    
    # Flood requests
    for _ in range(settings.OTP_RATE_LIMIT_MAX_REQUESTS):
        can_send, _ = otp_service.can_send_otp(email, ip)
        assert can_send is True
        otp_service.store_otp(email, "123456", ip)
        # Manually clear cooldown for test
        mock_redis.delete(otp_service._get_cooldown_key(email))
        
    can_send, message = otp_service.can_send_otp(email, ip)
    assert can_send is False
    assert "Too many requests" in message
