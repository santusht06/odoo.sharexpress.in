from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import uuid4
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    ASSET_MANAGER = "ASSET_MANAGER"
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD"
    EMPLOYEE = "EMPLOYEE"


class User(BaseModel):
    email: EmailStr


class OTPverify(BaseModel):
    transactionID: str
    OTP: str


class UpdateUser(BaseModel):
    name: Optional[str] = None


class UpdateRole(BaseModel):
    role: RoleEnum


class UpdateDepartment(BaseModel):
    department_id: str


class SearchEmail(BaseModel):
    email: EmailStr
