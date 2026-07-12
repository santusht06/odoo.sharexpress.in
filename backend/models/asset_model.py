from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class AssetStatus(str, Enum):
    AVAILABLE = "Available"
    ALLOCATED = "Allocated"
    RESERVED = "Reserved"
    UNDER_MAINTENANCE = "Under Maintenance"
    LOST = "Lost"
    RETIRED = "Retired"
    DISPOSED = "Disposed"


class AssetCondition(str, Enum):
    NEW = "New"
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"


class CreateAsset(BaseModel):
    name: str
    serial_number: Optional[str] = None
    category_id: str
    cost: Optional[float] = 0
    purchase_date: Optional[str] = None
    condition: AssetCondition = AssetCondition.NEW
    location: Optional[str] = ""
    department_id: Optional[str] = None
    is_bookable: bool = False
    description: Optional[str] = ""
    photos: Optional[List[str]] = []


class UpdateAsset(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    category_id: Optional[str] = None
    cost: Optional[float] = None
    purchase_date: Optional[str] = None
    condition: Optional[AssetCondition] = None
    location: Optional[str] = None
    department_id: Optional[str] = None
    is_bookable: Optional[bool] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = None


class UpdateAssetStatus(BaseModel):
    status: AssetStatus
