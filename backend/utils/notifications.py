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
