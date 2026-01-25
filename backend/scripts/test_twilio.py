"""
Test Twilio SMS sending.
Run this to verify your Twilio credentials work before deploying.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twilio credentials from .env
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_number = os.getenv("TWILIO_PHONE_NUMBER")

print("=" * 60)
print("TWILIO SMS TEST")
print("=" * 60)
print()

if not all([account_sid, auth_token, from_number]):
    print("❌ Error: Twilio credentials not found in .env file")
    print("\nAdd these to your .env file:")
    print("TWILIO_ACCOUNT_SID=AC...")
    print("TWILIO_AUTH_TOKEN=...")
    print("TWILIO_PHONE_NUMBER=+1...")
    exit(1)

print(f"📱 From Number: {from_number}")
print(f"🔑 Account SID: {account_sid[:10]}...")
print()

# Get recipient number
to_number = input("Enter recipient phone number (with country code, e.g., +919876543210): ")
test_otp = "123456"

print()
print(f"📤 Sending test SMS...")
print(f"   From: {from_number}")
print(f"   To: {to_number}")
print(f"   OTP: {test_otp}")
print()

try:
    # Import Twilio
    from twilio.rest import Client
    
    # Create client
    client = Client(account_sid, auth_token)
    
    # Send message
    message = client.messages.create(
        from_=from_number,
        body=f"Your ContractorConnect OTP is: {test_otp}. Valid for 10 minutes. Do not share this code.",
        to=to_number
    )
    
    print("✅ SMS sent successfully!")
    print(f"   Message SID: {message.sid}")
    print(f"   Status: {message.status}")
    print(f"   Direction: {message.direction}")
    print()
    print("✅ Check your phone for the SMS!")
    print()
    print("=" * 60)
    print("TWILIO CONFIGURATION WORKING! ✅")
    print("=" * 60)
    print("\nYou can now deploy to Render with these credentials.")
    
except ImportError:
    print("❌ Error: Twilio package not installed")
    print("\nInstall with:")
    print("  pip install twilio")
    
except Exception as e:
    print(f"❌ Error sending SMS: {e}")
    print("\nPossible issues:")
    print("1. Invalid Twilio credentials")
    print("2. Insufficient account balance")
    print("3. Phone number not verified (for trial accounts)")
    print("4. Invalid recipient phone number format")
    print("\nCheck your Twilio dashboard: https://console.twilio.com/")
