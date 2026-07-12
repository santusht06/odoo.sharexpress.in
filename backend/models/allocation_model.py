from pydantic import BaseModel
from typing import Optional


class CreateAllocation(BaseModel):
    asset_id: str
    allocated_to: str  # user_id
    department_id: Optional[str] = None
    expected_return_date: Optional[str] = None
    notes: Optional[str] = ""


class ReturnAsset(BaseModel):
    return_condition: str  # "Good", "Fair", "Poor", "Damaged"
    return_notes: Optional[str] = ""
