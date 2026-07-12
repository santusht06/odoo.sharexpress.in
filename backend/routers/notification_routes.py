from fastapi import APIRouter, Depends, HTTPException
from core.database import get_db
from utils.rbac import require_any_authenticated
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])
db = get_db()

@router.get("")
async def list_notifications(user=Depends(require_any_authenticated)):
    cursor = db.notifications.find({"user_id": user["user_id"]}).sort("created_at", -1)
    notifications = []
    async for doc in cursor:
        notifications.append(doc)
    return {"success": True, "notifications": notifications}


@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, user=Depends(require_any_authenticated)):
    res = await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": user["user_id"]},
        {"$set": {"is_read": True}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "message": "Notification marked as read"}


@router.post("/read-all")
async def mark_all_read(user=Depends(require_any_authenticated)):
    await db.notifications.update_many(
        {"user_id": user["user_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"success": True, "message": "All notifications marked as read"}


@router.get("/unread-count")
async def get_unread_count(user=Depends(require_any_authenticated)):
    count = await db.notifications.count_documents({"user_id": user["user_id"], "is_read": False})
    return {"success": True, "count": count}
