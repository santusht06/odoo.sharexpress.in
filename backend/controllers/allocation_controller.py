from models.allocation_model import CreateAllocation, ReturnAsset
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
from utils.activity_logger import log_activity
from utils.notifications import notify_user

db = get_db()

class AllocationController:
    @staticmethod
    async def allocate_asset(alloc_in: CreateAllocation, actor_id: str):
        # Enforce rule: No double allocation of the same asset.
        asset = await db.assets.find_one({"asset_id": alloc_in.asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        if asset.get("status") != "Available":
            raise HTTPException(
                status_code=400,
                detail=f"Asset is currently '{asset.get('status')}' and cannot be allocated."
            )

        # Verify user exists
        target_user = await db.users.find_one({"user_id": alloc_in.allocated_to})
        if not target_user:
            raise HTTPException(status_code=404, detail="Target employee not found")

        expected_date = None
        if alloc_in.expected_return_date:
            try:
                expected_date = datetime.fromisoformat(alloc_in.expected_return_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use ISO-8601 (YYYY-MM-DD).")

        allocation_id = str(uuid4())
        new_alloc = {
            "allocation_id": allocation_id,
            "asset_id": alloc_in.asset_id,
            "allocated_to": alloc_in.allocated_to,
            "allocated_by": actor_id,
            "department_id": alloc_in.department_id or target_user.get("department_id"),
            "allocated_at": datetime.utcnow(),
            "expected_return_date": expected_date,
            "actual_return_date": None,
            "return_condition": None,
            "return_notes": None,
            "status": "Active",
            "notes": alloc_in.notes
        }

        # Insert allocation
        await db.allocations.insert_one(new_alloc)

        # Update asset status
        await db.assets.update_one(
            {"asset_id": alloc_in.asset_id},
            {
                "$set": {
                    "status": "Allocated",
                    "department_id": alloc_in.department_id or target_user.get("department_id"),
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Notify user
        await notify_user(
            alloc_in.allocated_to,
            "ASSET_ASSIGNED",
            "New Asset Allocated",
            f"Asset '{asset.get('name')}' ({asset.get('asset_tag')}) has been allocated to you."
        )

        await log_activity(actor_id, "ALLOCATE", "ASSET", alloc_in.asset_id, new_value=new_alloc)
        return {"success": True, "allocation": new_alloc}

    @staticmethod
    async def list_allocations(status: str = None, employee_id: str = None):
        # Auto-update overdue records on list requests so dashboard/lists remain accurate
        await AllocationController.update_overdue_allocations()

        query = {}
        if status:
            query["status"] = status
        if employee_id:
            query["allocated_to"] = employee_id

        cursor = db.allocations.find(query).sort("allocated_at", -1)
        allocations = []
        async for doc in cursor:
            # Join asset details
            asset = await db.assets.find_one({"asset_id": doc.get("asset_id")})
            if asset:
                doc["asset_name"] = asset.get("name")
                doc["asset_tag"] = asset.get("asset_tag")
                doc["asset_serial"] = asset.get("serial_number")
            
            # Join user details
            user = await db.users.find_one({"user_id": doc.get("allocated_to")})
            if user:
                doc["allocated_to_name"] = user.get("name")
                doc["allocated_to_email"] = user.get("email")

            # Join assigner details
            assigner = await db.users.find_one({"user_id": doc.get("allocated_by")})
            if assigner:
                doc["allocated_by_name"] = assigner.get("name")

            allocations.append(doc)
        return {"success": True, "allocations": allocations}

    @staticmethod
    async def return_asset(allocation_id: str, return_in: ReturnAsset, actor_id: str):
        alloc = await db.allocations.find_one({"allocation_id": allocation_id})
        if not alloc:
            raise HTTPException(status_code=404, detail="Allocation not found")

        if alloc.get("status") not in ["Active", "Overdue"]:
            raise HTTPException(status_code=400, detail="Asset is already returned or processed")

        # Update allocation
        await db.allocations.update_one(
            {"allocation_id": allocation_id},
            {
                "$set": {
                    "actual_return_date": datetime.utcnow(),
                    "return_condition": return_in.return_condition,
                    "return_notes": return_in.return_notes,
                    "status": "Returned"
                }
            }
        )

        # Update asset status
        await db.assets.update_one(
            {"asset_id": alloc["asset_id"]},
            {
                "$set": {
                    "status": "Available",
                    "condition": return_in.return_condition, # Update current condition
                    "updated_at": datetime.utcnow()
                }
            }
        )

        asset = await db.assets.find_one({"asset_id": alloc["asset_id"]})
        
        # Notify
        await notify_user(
            alloc["allocated_to"],
            "ASSET_RETURNED",
            "Asset Return Processed",
            f"Your return for asset '{asset.get('name')}' ({asset.get('asset_tag')}) has been processed."
        )

        await log_activity(actor_id, "RETURN", "ASSET", alloc["asset_id"], details=f"Returned with condition {return_in.return_condition}")
        return {"success": True, "message": "Asset returned successfully"}

    @staticmethod
    async def update_overdue_allocations():
        """Flags all active allocations past expected_return_date as Overdue."""
        now = datetime.utcnow()
        overdue_cursor = db.allocations.find({
            "status": "Active",
            "expected_return_date": {"$lt": now}
        })
        
        async for alloc in overdue_cursor:
            await db.allocations.update_one(
                {"allocation_id": alloc["allocation_id"]},
                {"$set": {"status": "Overdue"}}
            )
            
            # Update matching asset status to Overdue return state (conceptually still Allocated or flag)
            # Fetch asset info for notification
            asset = await db.assets.find_one({"asset_id": alloc["asset_id"]})
            if asset:
                # Notify employee
                await notify_user(
                    alloc["allocated_to"],
                    "OVERDUE_ALERT",
                    "Asset Return Overdue!",
                    f"The expected return date for asset '{asset.get('name')}' ({asset.get('asset_tag')}) was {alloc.get('expected_return_date')}. Please return it immediately."
                )
