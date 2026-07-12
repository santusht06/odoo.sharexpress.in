from fastapi import Depends, HTTPException
from utils.JWT import check_auth_middleware
from functools import wraps


def require_role(*allowed_roles):
    """FastAPI dependency that checks if the authenticated user has one of the allowed roles."""
    async def role_checker(user: dict = Depends(check_auth_middleware)):
        user_role = user.get("role", "EMPLOYEE")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker


# Convenience shortcuts
require_admin = require_role("ADMIN")
require_asset_manager = require_role("ADMIN", "ASSET_MANAGER")
require_department_head = require_role("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD")
require_any_authenticated = require_role("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE")


# Role hierarchy for validation
ROLE_HIERARCHY = {
    "ADMIN": 4,
    "ASSET_MANAGER": 3,
    "DEPARTMENT_HEAD": 2,
    "EMPLOYEE": 1,
}

VALID_ROLES = list(ROLE_HIERARCHY.keys())


def can_assign_role(assigner_role: str, target_role: str) -> bool:
    """Check if a user with assigner_role can assign the target_role."""
    return ROLE_HIERARCHY.get(assigner_role, 0) > ROLE_HIERARCHY.get(target_role, 0)
