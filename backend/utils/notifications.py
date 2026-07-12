from core.database import get_db
from datetime import datetime
from uuid import uuid4

db = get_db()


async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
):
    """Create an in-app notification for a user."""
    try:
        await db.notifications.insert_one({
            "notification_id": str(uuid4()),
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "is_read": False,
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        print(f"Error creating notification: {e}")


async def notify_user(user_id: str, notification_type: str, title: str, message: str):
    """Convenience wrapper to create notification."""
    await create_notification(user_id, notification_type, title, message)
