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

import asyncio
import os
import sys
from uuid import uuid4
from datetime import datetime

# Adjust Python path to load parent modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import get_db
from models.user_model import RoleEnum

db = get_db()

async def seed_admin():
    admin_email = os.getenv("ADMIN_EMAIL", "admin@assetflow.com").strip().lower()
    
    print(f"Checking if Admin with email '{admin_email}' exists...")
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"User with email '{admin_email}' already exists. Updating role to ADMIN...")
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"role": RoleEnum.ADMIN, "is_active": True, "is_verified": True}}
        )
        print("Role updated successfully.")
        return

    # Create new Admin
    admin_id = str(uuid4())
    admin_user = {
        "user_id": admin_id,
        "name": "System Admin",
        "email": admin_email,
        "auth_provider": "OTP",
        "role": RoleEnum.ADMIN,
        "department_id": None,
        "is_verified": True,
        "is_active": True,
        "is_locked": False,
        "google_sub": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "deleted_at": None,
    }
    await db.users.insert_one(admin_user)
    print(f"Created new Admin user: System Admin ({admin_email})")

if __name__ == "__main__":
    asyncio.run(seed_admin())
