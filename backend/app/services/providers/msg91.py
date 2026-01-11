"""
MSG91 SMS provider for OTP delivery (India-focused).
"""

import requests
from typing import Optional
from app.services.providers.base import OTPDeliveryProvider
from app.core.config import settings


class MSG91Provider(OTPDeliveryProvider):
    """MSG91 SMS provider - popular and affordable in India."""
    
    def __init__(
        self,
        auth_key: Optional[str] = None,
        sender_id: Optional[str] = None,
        route: Optional[str] = None,
    ):
        """
        Initialize MSG91 provider.
        
        Args:
            auth_key: MSG91 auth key
            sender_id: Sender ID (6 chars, e.g., CTRCTR)
            route: Route (4 for transactional OTP)
        """
        self.auth_key = auth_key or getattr(settings, 'msg91_auth_key', None)
        self.sender_id = sender_id or getattr(settings, 'msg91_sender_id', 'CTRCTR')
        self.route = route or getattr(settings, 'msg91_route', '4')
        self.base_url = "https://api.msg91.com/api/v5/otp"
        
        if not self.auth_key:
            raise ValueError(
                "MSG91 auth key not configured. "
                "Set MSG91_AUTH_KEY in .env"
            )
    
    def send_otp(self, recipient: str, otp_code: str, purpose: str = "login") -> dict:
        """
        Send OTP via MSG91 SMS.
        
        Args:
            recipient: Phone number (with country code: 919876543210)
            otp_code: OTP code
            purpose: Purpose of OTP
            
        Returns:
            Dict with status and request_id
            
        Raises:
            Exception if sending fails
        """
        # Remove + if present
        mobile = recipient.replace('+', '')
        
        # MSG91 OTP API endpoint
        url = f"{self.base_url}"
        
        headers = {
            "authkey": self.auth_key,
            "content-type": "application/json"
        }
        
        payload = {
            "sender": self.sender_id,
            "mobile": mobile,
            "otp": otp_code,
            "template_id": getattr(settings, 'msg91_template_id', None),  # Optional
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "success": True,
                "provider": "msg91",
                "message_id": data.get("request_id", ""),
                "recipient": recipient,
                "response": data,
            }
            
        except requests.exceptions.RequestException as e:
            print(f"❌ MSG91 Error: {str(e)}")
            raise Exception(f"Failed to send SMS via MSG91: {str(e)}")
    
    def get_provider_name(self) -> str:
        """Return provider name."""
        return "MSG91 SMS (India)"
