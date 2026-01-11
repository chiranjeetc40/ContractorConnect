"""
Base provider interface for OTP delivery.
"""

from abc import ABC, abstractmethod
from typing import Optional


class OTPDeliveryProvider(ABC):
    """Abstract base class for OTP delivery providers."""
    
    @abstractmethod
    def send_otp(
        self, 
        recipient: str, 
        otp_code: str, 
        purpose: str = "login"
    ) -> dict:
        """
        Send OTP to recipient.
        
        Args:
            recipient: Phone number, email, or WhatsApp number
            otp_code: OTP code to send
            purpose: Purpose of OTP (login, registration, verification)
            
        Returns:
            Dict with status and message_id/error
            
        Raises:
            Exception if sending fails
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider name for logging."""
        pass
    
    def format_message(self, otp_code: str, purpose: str) -> str:
        """
        Format OTP message.
        
        Args:
            otp_code: OTP code
            purpose: Purpose of OTP
            
        Returns:
            Formatted message string
        """
        purpose_text = {
            "login": "login",
            "registration": "complete your registration",
            "verification": "verify your account",
            "password_reset": "reset your password",
        }.get(purpose, "authenticate")
        
        return (
            f"Your ContractorConnect OTP is: {otp_code}\n"
            f"Use this code to {purpose_text}.\n"
            f"Valid for 5 minutes. Do not share with anyone."
        )
