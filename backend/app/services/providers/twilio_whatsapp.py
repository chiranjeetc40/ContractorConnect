"""
Twilio WhatsApp provider for OTP delivery.
"""

from typing import Optional
from app.services.providers.base import OTPDeliveryProvider
from app.core.config import settings


class TwilioWhatsAppProvider(OTPDeliveryProvider):
    """Twilio WhatsApp provider for sending OTP via WhatsApp."""
    
    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        from_number: Optional[str] = None,
    ):
        """
        Initialize Twilio WhatsApp provider.
        
        Args:
            account_sid: Twilio account SID
            auth_token: Twilio auth token
            from_number: Twilio WhatsApp number (e.g., whatsapp:+14155238886)
        """
        self.account_sid = account_sid or getattr(settings, 'twilio_account_sid', None)
        self.auth_token = auth_token or getattr(settings, 'twilio_auth_token', None)
        self.from_number = from_number or getattr(settings, 'twilio_whatsapp_number', None)
        
        if not all([self.account_sid, self.auth_token, self.from_number]):
            raise ValueError(
                "Twilio WhatsApp credentials not configured. "
                "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in .env"
            )
        
        # Ensure from_number has whatsapp: prefix
        if not self.from_number.startswith('whatsapp:'):
            self.from_number = f'whatsapp:{self.from_number}'
        
        # Import Twilio client
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
        Send OTP via Twilio WhatsApp.
        
        Args:
            recipient: Phone number (will be prefixed with whatsapp:)
            otp_code: OTP code
            purpose: Purpose of OTP
            
        Returns:
            Dict with status and message SID
            
        Raises:
            Exception if sending fails
        """
        # Ensure recipient has whatsapp: prefix
        if not recipient.startswith('whatsapp:'):
            recipient = f'whatsapp:{recipient}'
        
        message_body = self.format_message(otp_code, purpose)
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=recipient
            )
            
            return {
                "success": True,
                "provider": "twilio_whatsapp",
                "message_id": message.sid,
                "recipient": recipient,
                "status": message.status,
            }
            
        except Exception as e:
            print(f"❌ Twilio WhatsApp Error: {str(e)}")
            raise Exception(f"Failed to send WhatsApp message via Twilio: {str(e)}")
    
    def get_provider_name(self) -> str:
        """Return provider name."""
        return "Twilio WhatsApp"
