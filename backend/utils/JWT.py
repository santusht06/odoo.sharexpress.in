from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Response, Request, HTTPException
from typing import Optional
from core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES, PRIVATE_KEY, PUBLIC_KEY, PROJECT_ENVIRONMENT
from core.database import get_db

is_prod = PROJECT_ENVIRONMENT == "PRODUCTION"
db = get_db()

# Use RSA keys if available, otherwise fall back to HS256 with JWT_SECRET
SIGN_KEY = PRIVATE_KEY if PRIVATE_KEY else JWT_SECRET
VERIFY_KEY = PUBLIC_KEY if PUBLIC_KEY else JWT_SECRET


def GenerateToken(user_id: str, response: Response) -> bool:
    """Generate JWT token and set it as HTTP-only cookie."""
    try:
        payload = {
            "sub": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRES),
        }

        token = jwt.encode(payload, SIGN_KEY, algorithm=JWT_ALGORITHM)

        response.set_cookie(
            key="user",
            value=token,
            httponly=True,
            secure=is_prod,
            samesite="none" if is_prod else "lax",
            domain=".sharexpress.in" if is_prod else None,
            path="/",
            max_age=JWT_EXPIRES * 24 * 3600,
        )

        return True

    except Exception as e:
        print(f"Error generating token: {e}")
        return False


async def get_current_user_optional(request: Request) -> Optional[dict]:
    """Get current user from JWT token if present, return None if not authenticated."""
    token: Optional[str] = request.cookies.get("user")

    if not token:
        return None

    try:
        payload = jwt.decode(token, VERIFY_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None

        user = await db.users.find_one(
            {"user_id": user_id, "deleted_at": None}, {"_id": 0}
        )

        if not user:
            return None

        if not user.get("is_active", True):
            return None

        return user

    except JWTError:
        return None
    except Exception:
        return None


async def check_auth_middleware(request: Request) -> dict:
    """Middleware to check authentication and return user data."""
    try:
        token = request.cookies.get("user")

        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        try:
            payload = jwt.decode(token, VERIFY_KEY, algorithms=[JWT_ALGORITHM])
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = await db.users.find_one(
            {"user_id": user_id, "deleted_at": None}, {"_id": 0}
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.get("is_locked"):
            raise HTTPException(
                status_code=403, detail="Account is locked. Please contact support."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=403, detail="Account is inactive. Please contact support."
            )

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


async def check_token(request: Request):
    """Check if user is already logged in — blocks OTP/login endpoints."""
    token = request.cookies.get("user")

    if not token:
        return

    try:
        jwt.decode(token, VERIFY_KEY, algorithms=[JWT_ALGORITHM])
        raise HTTPException(status_code=400, detail="You are already logged in")
    except JWTError:
        return
