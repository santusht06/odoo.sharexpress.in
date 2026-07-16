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
