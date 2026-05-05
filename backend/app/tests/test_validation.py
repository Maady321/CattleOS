import pytest
from pydantic import ValidationError
from app.schemas.user import UserCreate
from app.core.validation import sanitize_string

def test_xss_sanitization():
    # Simple script tag
    dirty = "John <script>alert('xss')</script> Doe"
    clean = sanitize_string(dirty)
    assert "<script>" not in clean
    assert "John alert('xss') Doe" == clean or "John  Doe" == clean # Bleach behavior depends on config

    # HTML tags
    dirty = "<b>Important</b> text"
    clean = sanitize_string(dirty)
    assert "<b>" not in clean
    assert "Important text" == clean

def test_strict_pydantic_validation():
    # Test unknown fields (extra="forbid")
    with pytest.raises(ValidationError) as exc:
        UserCreate(
            email="test@example.com",
            phone_number="1234567890",
            full_name="John Doe",
            password="password123",
            unknown_field="hacker"
        )
    assert "extra inputs are not permitted" in str(exc.value).lower()

    # Test type mismatch (strict=True)
    with pytest.raises(ValidationError) as exc:
        UserCreate(
            email="test@example.com",
            phone_number=1234567890, # int instead of str
            full_name="John Doe",
            password="password123"
        )
    # Strict mode should prevent coercion from int to str
    assert "input should be a valid string" in str(exc.value).lower()

def test_sanitized_str_field():
    # Verify that SanitizedStr actually sanitizes when creating a model
    user = UserCreate(
        email="test@example.com",
        phone_number="1234567890",
        full_name="John <script>alert(1)</script> Doe",
        password="password123"
    )
    assert "<script>" not in user.full_name
