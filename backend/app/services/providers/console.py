"""
Console provider for OTP delivery (development/testing).
"""

from app.services.providers.base import OTPDeliveryProvider


class ConsoleProvider(OTPDeliveryProvider):
    """Console provider - prints OTP to console (for development)."""
    
    def send_otp(self, recipient: str, otp_code: str, purpose: str = "login") -> dict:
        """
        Print OTP to console instead of sending.
        
        Args:
            recipient: Phone number or email
            otp_code: OTP code
            purpose: Purpose of OTP
            
        Returns:
            Dict with status and mock message_id
        """
        message = self.format_message(otp_code, purpose)
        
        print("\n" + "="*60)
        print(f"📱 OTP DELIVERY (Console Provider)")
        print("="*60)
        print(f"To: {recipient}")
        print(f"Purpose: {purpose}")
        print(f"Code: {otp_code}")
        print("-"*60)
        print(message)
        print("="*60 + "\n")
        
        return {
            "success": True,
            "provider": "console",
            "message_id": f"console_{otp_code}",
            "recipient": recipient,
        }
    
    def get_provider_name(self) -> str:
        """Return provider name."""
        return "Console (Development)"
