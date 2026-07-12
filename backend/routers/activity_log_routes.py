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

