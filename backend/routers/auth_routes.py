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

from fastapi import APIRouter, Response, Request, Depends
from models.user_model import User, OTPverify, UpdateUser, SearchEmail
from controllers.auth_controller import AuthController
from utils.JWT import check_auth_middleware, check_token
from core.database import get_db
from core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])
db = get_db()

@router.post("/sendOTP")
@limiter.limit("5/minute")
async def send_otp(
    request: Request,
    user: User,
    _: None = Depends(check_token),
):
    return await AuthController.SendOTPControl(user)


@router.post("/verifyOTP")
@limiter.limit("5/minute")
async def verify_otp(
    request: Request,
    payload: OTPverify,
    response: Response,
    _: None = Depends(check_token),
):
    return await AuthController.VerifyOTPControl(payload, response, request)



@router.get("/google/login")
async def google_login(request: Request):
    return await AuthController.redirect_to_uri(request)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, response: Response):
    return await AuthController.google_callback(request, response)


@router.post("/logout")
async def logout(response: Response, request: Request):
    return await AuthController.Logout_user(response, request)


@router.get("/me")
async def get_current_user(request: Request):
    from utils.JWT import get_current_user_optional
    user = await get_current_user_optional(request)
    if user:
        # Fetch matching department details if set
        department_name = None
        if user.get("department_id"):
            dept = await db.departments.find_one({"department_id": user["department_id"]})
            if dept:
                department_name = dept.get("name")
        
        safe_user = {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "picture": user.get("picture"),
            "user_name": user.get("name"),
            "auth_provider": user.get("auth_provider"),
            "role": user.get("role", "EMPLOYEE"),
            "department_id": user.get("department_id"),
            "department_name": department_name,
            "is_verified": user.get("is_verified"),
            "is_active": user.get("is_active"),
            "require_profile_setup": user.get("require_profile_setup", False),
            "created_at": user.get("created_at"),
        }
        return {"success": True, "user": safe_user}
    return {"success": False, "user": None}


@router.patch("/update")
async def update_user(name_data: UpdateUser, user=Depends(check_auth_middleware)):
    return await AuthController.update_user_name(user, name_data)


@router.post("/search")
async def search_by_email(data: SearchEmail, _: dict = Depends(check_auth_middleware)):
    normalized_email = data.email.strip().lower()
    user = await db.users.find_one(
        {"email": normalized_email},
        {"_id": 0, "email": 1, "name": 1, "picture": 1, "user_id": 1, "role": 1},
    )
    if not user:
        return {"success": False, "message": "User not found"}
    return {"success": True, "user": user}
