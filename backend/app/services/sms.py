import random
import logging
from typing import Optional
from app.core.config import settings

# In a real scenario, you would use 'twilio' or other SMS SDKs here
import twilio.rest

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        # These would come from environment variables in .env
        self.twilio_sid = getattr(settings, "TWILIO_ACCOUNT_SID", None)
        self.twilio_auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", None)
        self.twilio_phone_number = getattr(settings, "TWILIO_PHONE_NUMBER", None)
        
        if self.twilio_sid and self.twilio_auth_token and self.twilio_phone_number:
            try:
                self.client = twilio.rest.Client(self.twilio_sid, self.twilio_auth_token)
            except Exception as e:
                logger.error(f"Twilio init failed: {e}")
                self.client = None
        else:
            self.client = None

    def send_otp(self, phone_number: str, otp: str) -> bool:
        """
        Sends an OTP to the specified phone number.
        Returns True if successful, False otherwise.
        """
        message = f"Your CattleOS verification code is: {otp}. Valid for 5 minutes."
        
        if self.client:
            try:
                self.client.messages.create(
                    body=message,
                    from_=self.twilio_phone_number,
                    to=phone_number
                )
                logger.info(f"REAL SMS SENT to {phone_number} via Twilio")
                return True
            except Exception as e:
                logger.error(f"Failed to send SMS: {e}")
                return False
        else:
            # FALLBACK/MOCK for development if keys aren't set
            print("\n" + "="*50)
            print(f"SMS GATEWAY (MOCK): To {phone_number}")
            print(f"MESSAGE: {message}")
            print("="*50 + "\n")
            
            # Write to a file so the user can "see" the SMS in the workspace
            try:
                with open("c:\\sabari\\cattleOS\\LAST_OTP.txt", "w") as f:
                    f.write(f"TO: {phone_number}\nMESSAGE: {message}\nCODE: {otp}")
            except:
                pass
                
            return True

sms_service = SMSService()
