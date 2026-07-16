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

from fastapi import APIRouter, Depends, Query
from core.database import get_db
from utils.rbac import require_asset_manager
from typing import Optional
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])
db = get_db()

def _serialize_value(val):
    """Recursively serialize MongoDB-specific types to JSON-safe values."""
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, ObjectId):
        return str(val)
    if isinstance(val, dict):
        return {k: _serialize_value(v) for k, v in val.items()}
    if isinstance(val, list):
        return [_serialize_value(v) for v in val]
    return val

@router.get("")
async def get_logs(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    user=Depends(require_asset_manager)
):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if entity_type:
        query["entity_type"] = entity_type

    cursor = db.activity_logs.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit)
    logs = []
    async for doc in cursor:
        # Join user details
        u = await db.users.find_one({"user_id": doc.get("user_id")})
        doc["user_name"] = u.get("name") if u else "System"
        doc["user_email"] = u.get("email") if u else ""
        # Serialize nested values that may contain datetime/ObjectId
        logs.append(_serialize_value(doc))
    
    total = await db.activity_logs.count_documents(query)
    return {"success": True, "logs": logs, "total": total}


from utils.JWT import check_auth_middleware

@router.get("/my-history")
async def get_my_logs(
    limit: int = Query(5, ge=1, le=20),
    user: dict = Depends(check_auth_middleware)
):
    query = {"user_id": user["user_id"]}
    cursor = db.activity_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
    logs = []
    async for doc in cursor:
        doc["user_name"] = user.get("name")
        doc["user_email"] = user.get("email")
        logs.append(_serialize_value(doc))
    return {"success": True, "logs": logs}

