from pydantic import BaseModel
from typing import Optional


class CreateBooking(BaseModel):
    asset_id: str
    start_time: str  # ISO format
    end_time: str  # ISO format
    purpose: Optional[str] = ""


class RescheduleBooking(BaseModel):
    start_time: str
    end_time: str
