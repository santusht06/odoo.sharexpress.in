from models.asset_model import CreateAsset, UpdateAsset, UpdateAssetStatus, AssetStatus
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
import qrcode
import io
import base64
from utils.activity_logger import log_activity

db = get_db()

class AssetController:
    @staticmethod
    async def create_asset(asset_in: CreateAsset, actor_id: str):
        # Auto-generate Asset Tag (Format: AF-XXXX where XXXX is incremental index)
        # Fetch the highest current tag index to prevent collisions
        last_asset = await db.assets.find_one({}, sort=[("asset_tag", -1)])
        next_num = 1001
        if last_asset and last_asset.get("asset_tag"):
            try:
                tag_parts = last_asset["asset_tag"].split("-")
                if len(tag_parts) == 2 and tag_parts[1].isdigit():
                    next_num = int(tag_parts[1]) + 1
            except Exception:
                pass
        
        asset_tag = f"AF-{next_num}"
        asset_id = str(uuid4())

        # Generate base64 QR Code containing the asset details or search URI
        qr_img = qrcode.make(f"asset_id:{asset_id},tag:{asset_tag}")
        buffered = io.BytesIO()
        qr_img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()
        qr_code_data_url = f"data:image/png;base64,{qr_base64}"

        new_asset = {
            "asset_id": asset_id,
            "asset_tag": asset_tag,
            "name": asset_in.name,
            "serial_number": asset_in.serial_number,
            "category_id": asset_in.category_id,
            "cost": asset_in.cost,
            "purchase_date": asset_in.purchase_date,
            "condition": asset_in.condition,
            "location": asset_in.location,
            "department_id": asset_in.department_id,
            "is_bookable": asset_in.is_bookable,
            "description": asset_in.description,
            "status": AssetStatus.AVAILABLE,
            "qr_code_data_url": qr_code_data_url,
            "photos": asset_in.photos or [],
            "documents": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await db.assets.insert_one(new_asset)
        new_asset.pop("_id", None)
        await log_activity(actor_id, "CREATE", "ASSET", asset_id, new_value=new_asset)
        return {"success": True, "asset": new_asset}

    @staticmethod
    async def list_assets(category_id: str = None, department_id: str = None, status: str = None, is_bookable: bool = None, search: str = None):
        query = {}
        if category_id:
            query["category_id"] = category_id
        if department_id:
            query["department_id"] = department_id
        if status:
            query["status"] = status
        if is_bookable is not None:
            query["is_bookable"] = is_bookable
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"asset_tag": {"$regex": search, "$options": "i"}},
                {"serial_number": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}}
            ]

        cursor = db.assets.find(query, {"_id": 0})
        assets = []
        async for doc in cursor:
            # Join category name
            category = await db.categories.find_one({"category_id": doc.get("category_id")}, {"_id": 0})
            doc["category_name"] = category.get("name") if category else "Unknown"

            # Join department name
            dept = await db.departments.find_one({"department_id": doc.get("department_id")}, {"_id": 0})
            doc["department_name"] = dept.get("name") if dept else "Unassigned"

            assets.append(doc)
        return {"success": True, "assets": assets}

    @staticmethod
    async def get_asset_detail(asset_id: str):
        asset = await db.assets.find_one({"asset_id": asset_id}, {"_id": 0})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Join category details
        category = await db.categories.find_one({"category_id": asset.get("category_id")}, {"_id": 0})
        asset["category_name"] = category.get("name") if category else "Unknown"

        # Join department details
        dept = await db.departments.find_one({"department_id": asset.get("department_id")}, {"_id": 0})
        asset["department_name"] = dept.get("name") if dept else "Unassigned"

        # Fetch allocation history
        allocation_cursor = db.allocations.find({"asset_id": asset_id}, {"_id": 0}).sort("allocated_at", -1)
        allocation_history = []
        async for alloc in allocation_cursor:
            user = await db.users.find_one({"user_id": alloc.get("allocated_to")}, {"_id": 0})
            alloc["allocated_to_name"] = user.get("name") if user else "Unknown User"
            alloc["allocated_to_email"] = user.get("email") if user else ""
            allocation_history.append(alloc)
        asset["allocation_history"] = allocation_history

        # Fetch maintenance history
        maintenance_cursor = db.maintenance.find({"asset_id": asset_id}, {"_id": 0}).sort("created_at", -1)
        maintenance_history = []
        async for main_req in maintenance_cursor:
            maintenance_history.append(main_req)
        asset["maintenance_history"] = maintenance_history

        # Fetch transfer history
        transfer_cursor = db.transfers.find({"asset_id": asset_id}, {"_id": 0}).sort("requested_at", -1)
        transfer_history = []
        async for trans in transfer_cursor:
            from_u = await db.users.find_one({"user_id": trans.get("from_user")}, {"_id": 0})
            to_u = await db.users.find_one({"user_id": trans.get("to_user")}, {"_id": 0})
            trans["from_user_name"] = from_u.get("name") if from_u else "Unassigned"
            trans["to_user_name"] = to_u.get("name") if to_u else "Unknown"
            transfer_history.append(trans)
        asset["transfer_history"] = transfer_history

        # Fetch audit history
        audit_cursor = db.audit_entries.find({"asset_id": asset_id}, {"_id": 0}).sort("verified_at", -1)
        audit_history = []
        async for entry in audit_cursor:
            auditor = await db.users.find_one({"user_id": entry.get("auditor_id")}, {"_id": 0})
            entry["auditor_name"] = auditor.get("name") if auditor else "System"
            audit_history.append(entry)
        asset["audit_history"] = audit_history

        return {"success": True, "asset": asset}

    @staticmethod
    async def update_asset(asset_id: str, asset_in: UpdateAsset, actor_id: str):
        asset = await db.assets.find_one({"asset_id": asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        updates = {}
        for k, v in asset_in.dict(exclude_unset=True).items():
            updates[k] = v

        if updates:
            updates["updated_at"] = datetime.utcnow()
            await db.assets.update_one({"asset_id": asset_id}, {"$set": updates})
            await log_activity(actor_id, "UPDATE", "ASSET", asset_id, previous_value=asset, new_value=updates)

        return {"success": True, "message": "Asset updated successfully"}

    @staticmethod
    async def update_status(asset_id: str, status_in: UpdateAssetStatus, actor_id: str):
        asset = await db.assets.find_one({"asset_id": asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        await db.assets.update_one(
            {"asset_id": asset_id},
            {"$set": {"status": status_in.status, "updated_at": datetime.utcnow()}}
        )
        await log_activity(actor_id, "UPDATE_STATUS", "ASSET", asset_id, details=f"Changed status to {status_in.status}")
        return {"success": True, "message": f"Asset status updated to {status_in.status}"}
