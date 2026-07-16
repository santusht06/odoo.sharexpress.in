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
