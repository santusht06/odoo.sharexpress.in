# Copyright 2026 Sharexpress Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from core.config import MAIL_CONFIG


async def send_otp_email(email: str, otp: str):
    if not MAIL_CONFIG:
        print(f"[DEV] OTP for {email}: {otp} (mail not configured)")
        return True

    try:
        from fastapi_mail import FastMail, MessageSchema

        message = MessageSchema(
            subject="AssetFlow — Your Verification Code",
            recipients=[email],
            body=f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
                    <h2 style="color: #0052CC; margin-bottom: 8px;">AssetFlow</h2>
                    <p style="color: #42526E;">Your one-time verification code is:</p>
                    <h1 style="color: #172B4D; font-size: 32px; letter-spacing: 6px; margin: 24px 0;"><b>{otp}</b></h1>
                    <p style="color: #6B778C; font-size: 13px;">
                        This code will expire in 5 minutes.<br>
                        For your security, do not share it with anyone.
                    </p>
                </div>
            """,
            subtype="html",
        )

        fm = FastMail(MAIL_CONFIG)
        await fm.send_message(message)
        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        return False


async def send_notification_email(email: str, subject: str, body: str):
    if not MAIL_CONFIG:
        print(f"[DEV] Notification to {email}: {subject}")
        return True

    try:
        from fastapi_mail import FastMail, MessageSchema

        message = MessageSchema(
            subject=f"AssetFlow — {subject}",
            recipients=[email],
            body=body,
            subtype="html",
        )

        fm = FastMail(MAIL_CONFIG)
        await fm.send_message(message)
        return True

    except Exception as e:
        print(f"Error sending notification email: {e}")
        return False
