from pydantic import BaseModel
from typing import Optional


class CreateTransfer(BaseModel):
    asset_id: str
    to_user: str  # user_id
    notes: Optional[str] = ""


class ApproveTransfer(BaseModel):
    notes: Optional[str] = ""
