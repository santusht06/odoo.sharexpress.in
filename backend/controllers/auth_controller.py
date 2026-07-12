from models.user_model import User, OTPverify, UpdateUser, RoleEnum
from fastapi import HTTPException, Response, Request
from utils.OTP import sendOTP, VerifyOTPbyUtils
from core.database import get_db
from datetime import datetime
from utils.JWT import GenerateToken
from lib.generateOTP import generateOTP
from utils.SEND_MAILS import send_otp_email
from uuid import uuid4
from utils.google_auth import oauth
from fastapi.responses import RedirectResponse
from authlib.integrations.base_client.errors import OAuthError
from utils.activity_logger import log_activity
from core.config import FRONTEND_URI, PROJECT_ENVIRONMENT, GOOGLE_REDIRECT_URI, ADMIN_EMAIL
import logging

logger = logging.getLogger(__name__)
db = get_db()

class AuthController:
    @staticmethod
    async def SendOTPControl(user: User):
        try:
            if not user.email:
                raise HTTPException(status_code=400, detail="Email is required")

            otp_code = str(generateOTP())
            validate_otp = await sendOTP(user.email, otp_code)

            if not validate_otp.get("success"):
                raise HTTPException(
                    status_code=400, detail="Failed to generate OTP. Please try again."
                )

            transaction_id = validate_otp.get("transactionID")
            send_mail = await send_otp_email(user.email, otp_code)
            if not send_mail:
                raise HTTPException(status_code=400, detail="Failed to send email")

            return {
                "message": f"OTP has been sent successfully to {user.email}",
                "success": True,
                "transactionID": transaction_id,
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Error in SendOTPControl")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def VerifyOTPControl(payload: OTPverify, response: Response, request: Request):
        try:
            verify_result = await VerifyOTPbyUtils(payload.transactionID, payload.OTP)

            if not verify_result.get("valid"):
                raise HTTPException(
                    status_code=400,
                    detail=f"OTP verification failed: {verify_result.get('reason', 'Invalid OTP')}",
                )

            user_email = verify_result.get("email")
            if not user_email:
                raise HTTPException(
                    status_code=400, detail="Email not found in verification result"
                )

            user_exists = await db.users.find_one({"email": user_email})

            if not user_exists:
                user_id = str(uuid4())
                # If this is the configured admin email, assign ADMIN role, otherwise EMPLOYEE
                role = RoleEnum.ADMIN if user_email.strip().lower() == ADMIN_EMAIL.strip().lower() else RoleEnum.EMPLOYEE
                
                await db.users.insert_one(
                    {
                        "name": user_email.split("@")[0],
                        "user_id": user_id,
                        "email": user_email,
                        "auth_provider": "OTP",
                        "role": role,
                        "department_id": None,
                        "is_verified": True,
                        "is_active": True,
                        "is_locked": False,
                        "google_sub": None,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "deleted_at": None,
                    }
                )
                user_doc = await db.users.find_one({"user_id": user_id})
                safe_user = {
                    "user_id": user_doc.get("user_id"),
                    "email": user_doc.get("email"),
                    "picture": user_doc.get("picture"),
                    "user_name": user_doc.get("name"),
                    "auth_provider": user_doc.get("auth_provider"),
                    "role": user_doc.get("role", "EMPLOYEE"),
                    "department_id": user_doc.get("department_id"),
                    "is_verified": user_doc.get("is_verified"),
                    "is_active": user_doc.get("is_active"),
                    "created_at": user_doc.get("created_at").isoformat() if isinstance(user_doc.get("created_at"), datetime) else user_doc.get("created_at"),
                }
                GenerateToken(user_id, response)
                return {
                    "message": "User created and verified successfully",
                    "success": True,
                    "user": safe_user
                }

            if not user_exists.get("is_verified"):
                await db.users.update_one(
                    {"email": user_email},
                    {
                        "$set": {
                            "is_verified": True,
                            "is_active": True,
                            "auth_provider": "OTP",
                            "updated_at": datetime.utcnow(),
                        }
                    },
                )

            if user_exists.get("is_locked"):
                raise HTTPException(
                    status_code=403, detail="Account is locked. Please contact support."
                )

            if not user_exists.get("is_active", True):
                raise HTTPException(
                    status_code=403,
                    detail="Account is inactive. Please contact support.",
                )

            user_id = user_exists["user_id"]
            user_doc = await db.users.find_one({"user_id": user_id})
            safe_user = {
                "user_id": user_doc.get("user_id"),
                "email": user_doc.get("email"),
                "picture": user_doc.get("picture"),
                "user_name": user_doc.get("name"),
                "auth_provider": user_doc.get("auth_provider"),
                "role": user_doc.get("role", "EMPLOYEE"),
                "department_id": user_doc.get("department_id"),
                "is_verified": user_doc.get("is_verified"),
                "is_active": user_doc.get("is_active"),
                "created_at": user_doc.get("created_at").isoformat() if isinstance(user_doc.get("created_at"), datetime) else user_doc.get("created_at"),
            }

            GenerateToken(user_id, response)
            await log_activity(user_id, "LOGIN", "USER", user_id, details="Logged in via OTP")
            return {
                "message": "Login successful",
                "success": True,
                "user": safe_user
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Error in VerifyOTPControl")
            raise HTTPException(
                status_code=500, detail=f"Internal server error: {str(e)}"
            )

    @staticmethod
    async def redirect_to_uri(request: Request):
        try:
            if not oauth.google:
                raise HTTPException(status_code=400, detail="Google auth not configured")
            return await oauth.google.authorize_redirect(
                request,
                GOOGLE_REDIRECT_URI,
                prompt="select_account consent",
                access_type="offline",
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Error in redirect_to_uri")
            raise HTTPException(
                status_code=500, detail="Failed to initiate Google login"
            )

    @staticmethod
    async def google_callback(request: Request, response: Response):
        try:
            if not oauth.google:
                raise HTTPException(status_code=400, detail="Google auth not configured")
            token = await oauth.google.authorize_access_token(request)
            user_info = token.get("userinfo")

            if not user_info:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to retrieve user information from Google",
                )

            email = user_info.get("email")
            google_sub = user_info.get("sub")
            name = user_info.get("name")
            profile_pic = user_info.get("picture")

            if not email or not google_sub:
                raise HTTPException(
                    status_code=400, detail="Invalid user information from Google"
                )

            user = await db.users.find_one({"email": email})

            if not user:
                user_id = str(uuid4())
                role = RoleEnum.ADMIN if email.strip().lower() == ADMIN_EMAIL.strip().lower() else RoleEnum.EMPLOYEE
                await db.users.insert_one(
                    {
                        "name": name,
                        "user_id": user_id,
                        "email": email,
                        "picture": profile_pic,
                        "google_sub": google_sub,
                        "auth_provider": "GOOGLE",
                        "role": role,
                        "department_id": None,
                        "is_verified": True,
                        "is_active": True,
                        "is_locked": False,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "deleted_at": None,
                    }
                )
                await log_activity(user_id, "SIGNUP", "USER", user_id, details=f"Signed up via Google with role {role}")
            else:
                user_id = user["user_id"]
                if user.get("is_locked"):
                    raise HTTPException(
                        status_code=403,
                        detail="Account is locked. Please contact support.",
                    )

                if not user.get("is_active", True):
                    raise HTTPException(
                        status_code=403,
                        detail="Account is inactive. Please contact support.",
                    )

                if not user.get("google_sub"):
                    await db.users.update_one(
                        {"email": email},
                        {
                            "$set": {
                                "google_sub": google_sub,
                                "is_verified": True,
                                "updated_at": datetime.utcnow(),
                            }
                        },
                    )
                await log_activity(user_id, "LOGIN", "USER", user_id, details="Logged in via Google")

            GenerateToken(user_id, response)
            redirect = RedirectResponse(
                url=f"{FRONTEND_URI}/dashboard",
                status_code=302,
            )
            GenerateToken(user_id, redirect)
            return redirect

        except OAuthError as e:
            logger.exception("OAuth error")
            raise HTTPException(
                status_code=400,
                detail="Google login failed or expired. Please try again.",
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Error in google_callback")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def update_user_name(user, name_data: UpdateUser):
        try:
            user_id = user.get("user_id")
            if not name_data.name or not name_data.name.strip():
                raise HTTPException(status_code=400, detail="Name cannot be empty")

            result = await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": name_data.name, "updated_at": datetime.utcnow()}},
            )

            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="User not found")

            await log_activity(user_id, "UPDATE", "USER", user_id, details=f"Updated name to {name_data.name}")
            return {"message": "Profile updated successfully", "success": True}
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def Logout_user(response: Response, request: Request):
        try:
            token = request.cookies.get("user")
            if not token:
                raise HTTPException(status_code=401, detail="Not authenticated")

            response.delete_cookie(
                key="user",
                domain=".sharexpress.in" if PROJECT_ENVIRONMENT == "PRODUCTION" else None,
                path="/",
            )
            return {"message": "Logged out successfully", "success": True}
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error")
