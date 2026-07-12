from core.database import get_db
from datetime import datetime

db = get_db()

class DashboardController:
    @staticmethod
    async def get_kpis(user_role: str, user_id: str):
        # Determine scopes/filters if role is employee
        asset_filter = {}
        alloc_filter = {}
        booking_filter = {}
        transfer_filter = {}
        maintenance_filter = {}

        if user_role == "EMPLOYEE":
            # Employees only see things relative to them
            alloc_filter["allocated_to"] = user_id
            booking_filter["booked_by"] = user_id
            transfer_filter["$or"] = [{"requested_by": user_id}, {"to_user": user_id}, {"from_user": user_id}]
            maintenance_filter["$or"] = [{"raised_by": user_id}, {"created_by": user_id}]

        # 1. Assets count
        assets_available = await db.assets.count_documents({"status": "Available"})
        assets_allocated = await db.assets.count_documents({"status": "Allocated"})
        
        # 2. Maintenance requests count (Under maintenance / today)
        maintenance_today = await db.maintenance.count_documents({"status": "Under Repair"})
        maintenance_pending = await db.maintenance.count_documents({"status": "Pending Approval"})

        # 3. Active Bookings
        now = datetime.utcnow()
        active_bookings = await db.bookings.count_documents({
            "status": "Upcoming",
            "start_time": {"$lte": now},
            "end_time": {"$gte": now}
        })

        # 4. Pending Transfers
        pending_transfers = await db.transfers.count_documents({"status": "Requested"})

        # 5. Overdue / Upcoming Returns
        # Overdue returns: active allocations where expected return date < now
        overdue_returns = await db.allocations.count_documents({
            "status": "Overdue"
        })

        upcoming_returns = await db.allocations.count_documents({
            "status": "Active",
            "expected_return_date": {"$gt": now}
        })

        return {
            "success": True,
            "kpis": {
                "assets_available": assets_available,
                "assets_allocated": assets_allocated,
                "maintenance_today": maintenance_today,
                "maintenance_pending": maintenance_pending,
                "active_bookings": active_bookings,
                "pending_transfers": pending_transfers,
                "upcoming_returns": upcoming_returns,
                "overdue_returns": overdue_returns
            }
        }
