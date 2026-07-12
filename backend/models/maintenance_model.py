from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class MaintenancePriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CreateMaintenance(BaseModel):
    asset_id: str
    issue_description: str
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    photos: Optional[List[str]] = []


class AssignTechnician(BaseModel):
    technician_name: str
    notes: Optional[str] = ""


class ResolveMaintenance(BaseModel):
    resolution_notes: str
