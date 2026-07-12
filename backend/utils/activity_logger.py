from core.database import get_db
from datetime import datetime
from uuid import uuid4

db = get_db()


async def log_activity(
    user_id: str,
    action: str,
    entity_type: str,
    entity_id: str = None,
    previous_value: dict = None,
    new_value: dict = None,
    details: str = None,
):
    """Log an activity entry for audit trail."""
    try:
        await db.activity_logs.insert_one({
            "log_id": str(uuid4()),
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "previous_value": previous_value,
            "new_value": new_value,
            "details": details,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        print(f"Error logging activity: {e}")
