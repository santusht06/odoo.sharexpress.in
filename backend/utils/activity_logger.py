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
