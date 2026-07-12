from pydantic import BaseModel
from typing import Optional, List


class CustomField(BaseModel):
    field_name: str
    field_type: str = "text"  # text, number, date, boolean
    required: bool = False


class CreateCategory(BaseModel):
    name: str
    description: Optional[str] = ""
    custom_fields: Optional[List[CustomField]] = []


class UpdateCategory(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    custom_fields: Optional[List[CustomField]] = None
