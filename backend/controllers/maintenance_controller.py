from models.maintenance_model import CreateMaintenance, AssignTechnician, ResolveMaintenance
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
from utils.activity_logger import log_activity
from utils.notifications import notify_user

db = get_db()

class MaintenanceController:
    @staticmethod
    async def raise_request(maint_in: CreateMaintenance, actor_id: str):
        # Verify asset exists
        asset = await db.assets.find_one({"asset_id": maint_in.asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Raise request
        request_id = str(uuid4())
        new_req = {
            "request_id": request_id,
            "asset_id": maint_in.asset_id,
            "raised_by": actor_id,
            "issue_description": maint_in.issue_description,
            "priority": maint_in.priority,
            "assigned_technician": None,
            "resolution_notes": None,
            "status": "Pending Approval",
            "photos": maint_in.photos or [],
            "created_at": datetime.utcnow(),
            "approved_at": None,
            "resolved_at": None
        }

        await db.maintenance.insert_one(new_req)
        new_req.pop("_id", None)

        # Notify Asset Managers & Admins
        managers = db.users.find({"role": {"$in": ["ADMIN", "ASSET_MANAGER"]}})
        async for manager in managers:
            await notify_user(
                manager["user_id"],
                "MAINTENANCE_REQUESTED",
                "New Maintenance Request",
                f"Maintenance raised for '{asset.get('name')}' ({asset.get('asset_tag')}). Priority: {maint_in.priority}."
            )

        await log_activity(actor_id, "RAISE_MAINTENANCE", "ASSET", maint_in.asset_id, new_value=new_req)
        return {"success": True, "maintenance": new_req}

    @staticmethod
    async def list_requests(asset_id: str = None, employee_id: str = None, status: str = None):
        query = {}
        if asset_id:
            query["asset_id"] = asset_id
        if employee_id:
            query["raised_by"] = employee_id
        if status:
            query["status"] = status

        cursor = db.maintenance.find(query, {"_id": 0}).sort("created_at", -1)
        requests = []
        async for doc in cursor:
            # Join asset details
            asset = await db.assets.find_one({"asset_id": doc.get("asset_id")})
            if asset:
                doc["asset_name"] = asset.get("name")
                doc["asset_tag"] = asset.get("asset_tag")
                doc["asset_location"] = asset.get("location")

            # Join owner details
            user = await db.users.find_one({"user_id": doc.get("raised_by")})
            if user:
                doc["raised_by_name"] = user.get("name")

            requests.append(doc)
        return {"success": True, "requests": requests}

    @staticmethod
    async def resolve_request_status(request_id: str, approve: bool, actor_id: str):
        req = await db.maintenance.find_one({"request_id": request_id})
        if not req:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        if req.get("status") != "Pending Approval":
            raise HTTPException(status_code=400, detail="Only Pending requests can be approved/rejected")

        status_str = "Approved" if approve else "Rejected"

        await db.maintenance.update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "status": status_str,
                    "approved_at": datetime.utcnow()
                }
            }
        )

        # Update Asset Status to Under Maintenance on approval
        if approve:
            await db.assets.update_one(
                {"asset_id": req["asset_id"]},
                {"$set": {"status": "Under Maintenance", "updated_at": datetime.utcnow()}}
            )

        asset = await db.assets.find_one({"asset_id": req["asset_id"]})
        
        # Notify
        await notify_user(
            req["raised_by"],
            f"MAINTENANCE_{status_str.upper()}",
            f"Maintenance Request {status_str}",
            f"Your maintenance request for asset '{asset.get('name') if asset else 'Resource'}' was {status_str.lower()}."
        )

        await log_activity(actor_id, f"MAINTENANCE_{status_str.upper()}", "MAINTENANCE", request_id)
        return {"success": True, "message": f"Maintenance request successfully {status_str.lower()}"}

    @staticmethod
    async def assign_technician(request_id: str, assign_in: AssignTechnician, actor_id: str):
        req = await db.maintenance.find_one({"request_id": request_id})
        if not req:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        if req.get("status") not in ["Approved", "Under Repair"]:
            raise HTTPException(status_code=400, detail="Cannot assign technician for this status")

        await db.maintenance.update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "assigned_technician": assign_in.technician_name,
                    "status": "Under Repair"
                }
            }
        )

        await log_activity(actor_id, "MAINTENANCE_ASSIGN_TECHNICIAN", "MAINTENANCE", request_id, details=assign_in.technician_name)
        return {"success": True, "message": "Technician assigned and request set to In Progress"}

    @staticmethod
    async def resolve_maintenance(request_id: str, resolve_in: ResolveMaintenance, actor_id: str):
        req = await db.maintenance.find_one({"request_id": request_id})
        if not req:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        if req.get("status") != "Under Repair":
            raise HTTPException(status_code=400, detail="Only requests Under Repair can be marked resolved")

        # Resolve maintenance
        await db.maintenance.update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "status": "Resolved",
                    "resolution_notes": resolve_in.resolution_notes,
                    "resolved_at": datetime.utcnow()
                }
            }
        )

        # Set asset back to Available
        await db.assets.update_one(
            {"asset_id": req["asset_id"]},
            {"$set": {"status": "Available", "updated_at": datetime.utcnow()}}
        )

        asset = await db.assets.find_one({"asset_id": req["asset_id"]})

        # Notify
        await notify_user(
            req["raised_by"],
            "MAINTENANCE_RESOLVED",
            "Maintenance Resolved",
            f"Maintenance for '{asset.get('name') if asset else 'Resource'}' has been marked Resolved."
        )

        await log_activity(actor_id, "MAINTENANCE_RESOLVE", "MAINTENANCE", request_id, details=resolve_in.resolution_notes)
        return {"success": True, "message": "Maintenance marked resolved successfully"}
