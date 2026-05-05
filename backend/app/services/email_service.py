import logging
from typing import Optional
from app.core.config import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # These would come from environment variables in .env
        self.smtp_server = getattr(settings, "SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = getattr(settings, "SMTP_PORT", 587)
        self.smtp_user = getattr(settings, "SMTP_USER", None)
        self.smtp_password = getattr(settings, "SMTP_PASSWORD", None)
        self.sender_email = getattr(settings, "SENDER_EMAIL", self.smtp_user)

    def send_otp(self, email: str, otp: str) -> bool:
        """
        Sends an OTP to the specified email address.
        """
        subject = f"{otp} is your CattleOS access code"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; rounded: 20px;">
                    <h2 style="color: #000; font-weight: 900; font-size: 24px;">CattleOS</h2>
                    <p style="font-size: 16px;">Secure Access Code</p>
                    <div style="background: #f7f7f7; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #2D5A27;">{otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #999;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        
        if self.smtp_user and self.smtp_password:
            try:
                msg = MIMEMultipart()
                msg['From'] = self.sender_email
                msg['To'] = email
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'html'))

                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
                
                logger.info(f"REAL EMAIL SENT to {email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email: {e}")
                return False
        else:
            # FALLBACK/MOCK for development
            print("\n" + "="*50)
            print(f"EMAIL GATEWAY (MOCK): To {email}")
            print(f"SUBJECT: {subject}")
            print(f"OTP: {otp}")
            print("="*50 + "\n")
            
            # Write to a file for visibility
            try:
                with open("c:\\sabari\\cattleOS\\LAST_EMAIL_OTP.txt", "w") as f:
                    f.write(f"TO: {email}\nOTP: {otp}")
            except:
                pass
                
            return True

email_service = EmailService()
