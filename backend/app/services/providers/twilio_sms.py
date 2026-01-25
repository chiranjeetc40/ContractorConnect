"""
Twilio SMS provider for OTP delivery.
"""

from typing import Optional
from app.services.providers.base import OTPDeliveryProvider
from app.core.config import settings


class TwilioSMSProvider(OTPDeliveryProvider):
    """Twilio SMS provider for sending OTP via SMS."""
    
    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        from_number: Optional[str] = None,
    ):
        """
        Initialize Twilio provider.
        
        Args:
            account_sid: Twilio account SID (from env if not provided)
            auth_token: Twilio auth token (from env if not provided)
            from_number: Twilio phone number (from env if not provided)
        """
        self.account_sid = account_sid or getattr(settings, 'twilio_account_sid', None)
        self.auth_token = auth_token or getattr(settings, 'twilio_auth_token', None)
        self.from_number = from_number or getattr(settings, 'twilio_phone_number', None)
        
        if not all([self.account_sid, self.auth_token, self.from_number]):
            raise ValueError(
                "Twilio credentials not configured. "
                "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env"
            )
        
        # Import Twilio client (lazy import to avoid dependency in dev)
        try:
            from twilio.rest import Client
            self.client = Client(self.account_sid, self.auth_token)
        except ImportError:
            raise ImportError(
                "Twilio package not installed. "
                "Install with: pip install twilio"
            )
    
    def send_otp(self, recipient: str, otp_code: str, purpose: str = "login") -> dict:
        """
        Send OTP via Twilio SMS.
        
        Args:
            recipient: Phone number (E.164 format: +919876543210)
            otp_code: OTP code
            purpose: Purpose of OTP
            
        Returns:
            Dict with status and message SID
            
        Raises:
            Exception if sending fails
        """
        message_body = self.format_message(otp_code, purpose)
        
        try:
            print(f"📱 Sending SMS via Twilio to +91{recipient}")
            print(f"📱 From: {self.from_number}")
            
            message = self.client.messages.create(
                from_=self.from_number,
                body=message_body,
                to=f'+91{recipient}'
            )
            
            print(f"✅ SMS sent successfully! SID: {message.sid}, Status: {message.status}")
            
            return {
                "success": True,
                "provider": "twilio_sms",
                "message_id": message.sid,
                "recipient": recipient,
                "status": message.status,
            }
            
        except Exception as e:
            # Log error and re-raise
            print(f"❌ Twilio SMS Error: {str(e)}")
            raise Exception(f"Failed to send SMS via Twilio: {str(e)}")
    
    def get_provider_name(self) -> str:
        """Return provider name."""
        return "Twilio SMS"
