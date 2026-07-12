from core.database import get_db
from datetime import datetime, timedelta

db = get_db()

class ReportController:
    @staticmethod
    async def get_utilization():
        # Active vs total bookable assets
        total_bookable = await db.assets.count_documents({"is_bookable": True})
        total_allocated = await db.assets.count_documents({"is_bookable": True, "status": "Allocated"})
        total_maintenance = await db.assets.count_documents({"is_bookable": True, "status": "Under Maintenance"})
        total_available = await db.assets.count_documents({"is_bookable": True, "status": "Available"})

        # Get total bookings done in last 30 days
        month_ago = datetime.utcnow() - timedelta(days=30)
        recent_bookings = await db.bookings.count_documents({"start_time": {"$gte": month_ago}})

        return {
            "success": True,
            "data": {
                "total_bookable": total_bookable,
                "allocated": total_allocated,
                "under_maintenance": total_maintenance,
                "available": total_available,
                "bookings_last_30_days": recent_bookings,
                "utilization_rate": round((total_allocated / total_bookable * 100), 2) if total_bookable > 0 else 0
            }
        }

    @staticmethod
    async def get_idle_assets():
        # Assets marked Available for > 30 days without booking or allocation activity
        month_ago = datetime.utcnow() - timedelta(days=30)
        cursor = db.assets.find({
            "status": "Available",
            "updated_at": {"$lt": month_ago}
        })
        idle_assets = []
        async for doc in cursor:
            # Join category name
            category = await db.categories.find_one({"category_id": doc.get("category_id")})
            doc["category_name"] = category.get("name") if category else "Unknown"
            idle_assets.append(doc)

        return {"success": True, "idle_assets": idle_assets}

    @staticmethod
    async def get_maintenance_frequency():
        # Aggregate number of requests per asset
        pipeline = [
            {"$group": {"_id": "$asset_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        cursor = db.maintenance.aggregate(pipeline)
        results = []
        async for item in cursor:
            asset = await db.assets.find_one({"asset_id": item["_id"]})
            if asset:
                results.append({
                    "asset_id": asset["asset_id"],
                    "asset_name": asset["name"],
                    "asset_tag": asset["asset_tag"],
                    "maintenance_count": item["count"]
                })
        return {"success": True, "data": results}

    @staticmethod
    async def get_department_allocation():
        # Allocation counts per department
        pipeline = [
            {"$match": {"status": "Allocated"}},
            {"$group": {"_id": "$department_id", "count": {"$sum": 1}}}
        ]
        cursor = db.assets.aggregate(pipeline)
        results = []
        async for item in cursor:
            dept_id = item["_id"]
            dept = await db.departments.find_one({"department_id": dept_id}) if dept_id else None
            results.append({
                "department_id": dept_id,
                "department_name": dept.get("name") if dept else "Unassigned",
                "allocated_count": item["count"]
            })
        return {"success": True, "data": results}

    @staticmethod
    async def get_booking_heatmap():
        # Count bookings grouped by hour of the day
        pipeline = [
            {
                "$project": {
                    "hour": {"$hour": "$start_time"},
                    "dayOfWeek": {"$dayOfWeek": "$start_time"}
                }
            },
            {
                "$group": {
                    "_id": {"hour": "$hour", "dayOfWeek": "$dayOfWeek"},
                    "count": {"$sum": 1}
                }
            }
        ]
        cursor = db.bookings.aggregate(pipeline)
        results = []
        async for item in cursor:
            results.append({
                "hour": item["_id"]["hour"],
                "day_of_week": item["_id"]["dayOfWeek"],
                "booking_count": item["count"]
            })
        return {"success": True, "heatmap": results}

    @staticmethod
    async def get_nearing_retirement():
        # Let's say assets > 4 years old or nearing retirement category rule
        # Find category names matching hardware/electronics or filter by date
        four_years_ago = datetime.utcnow() - timedelta(days=4*365)
        # Fetch assets where purchase_date < four_years_ago
        # Note: purchase_date is stored as string YYYY-MM-DD or similar
        # Fallback to older records
        cursor = db.assets.find({
            "status": {"$nin": ["Retired", "Disposed"]}
        })
        nearing = []
        async for doc in cursor:
            p_date_str = doc.get("purchase_date")
            if p_date_str:
                try:
                    p_date = datetime.fromisoformat(p_date_str)
                    if p_date < four_years_ago:
                        category = await db.categories.find_one({"category_id": doc.get("category_id")})
                        doc["category_name"] = category.get("name") if category else "Unknown"
                        nearing.append(doc)
                except ValueError:
                    pass
        return {"success": True, "assets": nearing[:15]}
