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
import logging

logger = logging.getLogger(__name__)

db = get_db()


async def create_indexes():
    """Create MongoDB indexes for all collections."""
    try:
        # Users
        await db.users.create_index("user_id", unique=True)
        await db.users.create_index("email", unique=True)

        # Departments
        await db.departments.create_index("department_id", unique=True)
        await db.departments.create_index("name")

        # Categories
        await db.categories.create_index("category_id", unique=True)
        await db.categories.create_index("name")

        # Assets
        await db.assets.create_index("asset_id", unique=True)
        await db.assets.create_index("asset_tag", unique=True)
        await db.assets.create_index("serial_number", sparse=True)
        await db.assets.create_index("category_id")
        await db.assets.create_index("department_id")
        await db.assets.create_index("status")
        await db.assets.create_index("is_bookable")

        # Allocations
        await db.allocations.create_index("allocation_id", unique=True)
        await db.allocations.create_index("asset_id")
        await db.allocations.create_index("allocated_to")
        await db.allocations.create_index("status")

        # Transfers
        await db.transfers.create_index("transfer_id", unique=True)
        await db.transfers.create_index("asset_id")
        await db.transfers.create_index("status")

        # Bookings
        await db.bookings.create_index("booking_id", unique=True)
        await db.bookings.create_index("asset_id")
        await db.bookings.create_index("booked_by")
        await db.bookings.create_index([("asset_id", 1), ("start_time", 1), ("end_time", 1)])

        # Maintenance
        await db.maintenance.create_index("request_id", unique=True)
        await db.maintenance.create_index("asset_id")
        await db.maintenance.create_index("status")

        # Audit Cycles
        await db.audit_cycles.create_index("cycle_id", unique=True)
        await db.audit_entries.create_index("cycle_id")
        await db.audit_entries.create_index("asset_id")

        # Notifications
        await db.notifications.create_index("user_id")
        await db.notifications.create_index([("user_id", 1), ("is_read", 1)])

        # Activity Logs
        await db.activity_logs.create_index("user_id")
        await db.activity_logs.create_index("entity_type")
        await db.activity_logs.create_index("timestamp")

        logger.info("All MongoDB indexes created successfully")

    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise
