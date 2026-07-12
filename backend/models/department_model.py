from pydantic import BaseModel
from typing import Optional


class CreateDepartment(BaseModel):
    name: str
    description: Optional[str] = ""
    parent_id: Optional[str] = None
    head_id: Optional[str] = None


class UpdateDepartment(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    head_id: Optional[str] = None


class UpdateDepartmentStatus(BaseModel):
    status: str  # "Active" or "Inactive"
