"""
Provider factory for OTP delivery.
"""

from typing import Optional
from app.services.providers.base import OTPDeliveryProvider
from app.services.providers.console import ConsoleProvider
from app.services.providers.email import EmailProvider
from app.core.config import settings


def get_otp_provider(provider_type: Optional[str] = None) -> OTPDeliveryProvider:
    """
    Get OTP delivery provider based on configuration.
    
    Args:
        provider_type: Override provider type (for testing)
        
    Returns:
        OTPDeliveryProvider instance
        
    Raises:
        ValueError if provider type is invalid or not configured
    """
    provider = provider_type or getattr(settings, 'otp_delivery_method', 'console')
    
    if provider == 'console':
        return ConsoleProvider()
    
    elif provider == 'email':
        return EmailProvider()
    
    elif provider == 'sms_twilio':
        try:
            from app.services.providers.twilio_sms import TwilioSMSProvider
            return TwilioSMSProvider()
        except ImportError:
            raise ValueError(
                "Twilio SMS provider requires 'twilio' package. "
                "Install with: pip install twilio"
            )
    
    elif provider == 'whatsapp_twilio':
        try:
            from app.services.providers.twilio_whatsapp import TwilioWhatsAppProvider
            return TwilioWhatsAppProvider()
        except ImportError:
            raise ValueError(
                "Twilio WhatsApp provider requires 'twilio' package. "
                "Install with: pip install twilio"
            )
    
    elif provider == 'sms_msg91':
        from app.services.providers.msg91 import MSG91Provider
        return MSG91Provider()
    
    else:
        raise ValueError(
            f"Unknown OTP provider: {provider}. "
            f"Valid options: console, email, sms_twilio, whatsapp_twilio, sms_msg91"
        )


def get_fallback_provider(fallback_type: Optional[str] = None) -> Optional[OTPDeliveryProvider]:
    """
    Get fallback OTP delivery provider.
    
    Args:
        fallback_type: Override fallback type
        
    Returns:
        OTPDeliveryProvider instance or None
    """
    fallback = fallback_type or getattr(settings, 'otp_fallback_method', None)
    
    if not fallback or fallback == 'none':
        return None
    
    try:
        return get_otp_provider(fallback)
    except Exception as e:
        print(f"⚠️ Fallback provider '{fallback}' failed to initialize: {e}")
        return None
