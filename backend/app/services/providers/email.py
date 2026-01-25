"""
Email provider for OTP delivery.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.services.providers.base import OTPDeliveryProvider
from app.core.config import settings


class EmailProvider(OTPDeliveryProvider):
    """Email provider for sending OTP via email."""
    
    def __init__(
        self,
        smtp_host: Optional[str] = None,
        smtp_port: Optional[int] = None,
        smtp_user: Optional[str] = None,
        smtp_password: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ):
        """
        Initialize Email provider.
        
        Args:
            smtp_host: SMTP server host
            smtp_port: SMTP server port
            smtp_user: SMTP username
            smtp_password: SMTP password
            from_email: From email address
            from_name: From name
        """
        self.smtp_host = smtp_host or settings.smtp_host
        self.smtp_port = smtp_port or settings.smtp_port
        self.smtp_user = smtp_user or settings.smtp_user
        self.smtp_password = smtp_password or settings.smtp_password
        self.from_email = from_email or settings.smtp_from
        self.from_name = from_name or settings.smtp_from_name
        
        if not all([self.smtp_host, self.smtp_user, self.smtp_password]):
            raise ValueError(
                "Email credentials not configured. "
                "Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env"
            )
    
    def send_otp(self, recipient: str, otp_code: str, purpose: str = "login") -> dict:
        """
        Send OTP via email.
        
        Args:
            recipient: Email address
            otp_code: OTP code
            purpose: Purpose of OTP
            
        Returns:
            Dict with status
            
        Raises:
            Exception if sending fails
        """
        subject = f"Your ContractorConnect OTP: {otp_code}"
        
        # Create HTML email
        html_body = self._create_html_body(otp_code, purpose)
        text_body = self.format_message(otp_code, purpose)
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = recipient
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        message.attach(part1)
        message.attach(part2)
        
        try:
            # Connect to SMTP server with better error handling and SSL support
            print(f"📧 Attempting to send email to {recipient}")
            print(f"📧 SMTP Host: {self.smtp_host}:{self.smtp_port}")
            
            # Try SSL connection first (port 465) - more reliable on cloud platforms
            if self.smtp_port == 465:
                # Use SMTP_SSL for port 465
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=30) as server:
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(message)
                    print(f"✅ Email sent successfully via SSL to {recipient}")
            else:
                # Use STARTTLS for ports 587 or 25
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(message)
                    print(f"✅ Email sent successfully via STARTTLS to {recipient}")
            
            return {
                "success": True,
                "provider": "email",
                "message_id": f"email_{otp_code}",
                "recipient": recipient,
            }
            
        except Exception as e:
            print(f"❌ Email Error: {str(e)}")
            print(f"❌ Failed with SMTP {self.smtp_host}:{self.smtp_port}")
            raise Exception(f"Failed to send email: {str(e)}")
    
    def _create_html_body(self, otp_code: str, purpose: str) -> str:
        """Create HTML email body."""
        purpose_text = {
            "login": "login to your account",
            "registration": "complete your registration",
            "verification": "verify your account",
            "password_reset": "reset your password",
        }.get(purpose, "authenticate")
        
        return f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .otp-box {{
            background-color: #f4f4f4;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }}
        .otp-code {{
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 5px;
        }}
        .warning {{
            color: #dc3545;
            font-size: 12px;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h2>ContractorConnect OTP Verification</h2>
        <p>Hello,</p>
        <p>You requested an OTP to {purpose_text}.</p>
        
        <div class="otp-box">
            <p style="margin: 0; font-size: 14px;">Your OTP is:</p>
            <p class="otp-code">{otp_code}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">Valid for 5 minutes</p>
        </div>
        
        <p>If you didn't request this OTP, please ignore this email.</p>
        
        <p class="warning">
            ⚠️ Do not share this OTP with anyone. ContractorConnect will never ask for your OTP.
        </p>
        
        <p>
            Best regards,<br>
            ContractorConnect Team
        </p>
    </div>
</body>
</html>
"""
    
    def get_provider_name(self) -> str:
        """Return provider name."""
        return "Email (SMTP)"
