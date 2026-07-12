from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class AuditResult(str, Enum):
    VERIFIED = "Verified"
    MISSING = "Missing"
    DAMAGED = "Damaged"


class CreateAuditCycle(BaseModel):
    name: str
    scope_department: Optional[str] = None
    scope_location: Optional[str] = None
    date_range_start: Optional[str] = None
    date_range_end: Optional[str] = None
    auditors: List[str] = []  # list of user_ids


class CreateAuditEntry(BaseModel):
    asset_id: str
    result: AuditResult
    notes: Optional[str] = ""
