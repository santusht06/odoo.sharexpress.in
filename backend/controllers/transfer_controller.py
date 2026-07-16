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

from models.transfer_model import CreateTransfer, ApproveTransfer
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
from utils.activity_logger import log_activity
from utils.notifications import notify_user

db = get_db()

class TransferController:
    @staticmethod
    async def request_transfer(transfer_in: CreateTransfer, requester_id: str):
        # Verify asset exists
        asset = await db.assets.find_one({"asset_id": transfer_in.asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Verify target user exists
        target_user = await db.users.find_one({"user_id": transfer_in.to_user})
        if not target_user:
            raise HTTPException(status_code=404, detail="Target employee not found")

        # Determine current holder/department
        current_alloc = await db.allocations.find_one(
            {"asset_id": transfer_in.asset_id, "status": {"$in": ["Active", "Overdue"]}}
        )
        from_user = current_alloc["allocated_to"] if current_alloc else None

        # Verify requester has permission to request (either the holder or a manager/dept head)
        requester = await db.users.find_one({"user_id": requester_id})
        if requester.get("role") == "EMPLOYEE" and from_user != requester_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot request transfer for an asset not allocated to you."
            )

        transfer_id = str(uuid4())
        new_transfer = {
            "transfer_id": transfer_id,
            "asset_id": transfer_in.asset_id,
            "from_user": from_user,
            "to_user": transfer_in.to_user,
            "requested_by": requester_id,
            "approved_by": None,
            "status": "Requested",
            "notes": transfer_in.notes,
            "requested_at": datetime.utcnow(),
            "resolved_at": None
        }

        await db.transfers.insert_one(new_transfer)
        new_transfer.pop("_id", None)

        # Notify managers/dept heads
        # Find asset managers & admin users to notify
        # Also notify department heads if department asset
        managers = db.users.find({"role": {"$in": ["ADMIN", "ASSET_MANAGER"]}})
        async for manager in managers:
            await notify_user(
                manager["user_id"],
                "TRANSFER_REQUESTED",
                "New Transfer Request",
                f"Transfer requested for asset '{asset.get('name')}' by {requester.get('name')} to {target_user.get('name')}."
            )

        await log_activity(requester_id, "REQUEST_TRANSFER", "ASSET", transfer_in.asset_id, new_value=new_transfer)
        return {"success": True, "transfer": new_transfer}

    @staticmethod
    async def list_transfers(user_role: str, user_id: str):
        query = {}
        # Employees can only see requests they requested, are getting transferred from, or are getting transferred to
        if user_role == "EMPLOYEE":
            query["$or"] = [
                {"requested_by": user_id},
                {"from_user": user_id},
                {"to_user": user_id}
            ]
        # Department heads can see transfers relating to users in their department
        elif user_role == "DEPARTMENT_HEAD":
            # Find department
            dept = await db.departments.find_one({"head_id": user_id})
            if dept:
                # Users in dept
                users_in_dept = []
                cursor = db.users.find({"department_id": dept["department_id"]})
                async for u in cursor:
                    users_in_dept.append(u["user_id"])
                query["$or"] = [
                    {"requested_by": {"$in": users_in_dept}},
                    {"from_user": {"$in": users_in_dept}},
                    {"to_user": {"$in": users_in_dept}}
                ]

        cursor = db.transfers.find(query, {"_id": 0}).sort("requested_at", -1)
        transfers = []
        async for doc in cursor:
            # Join asset details
            asset = await db.assets.find_one({"asset_id": doc.get("asset_id")})
            if asset:
                doc["asset_name"] = asset.get("name")
                doc["asset_tag"] = asset.get("asset_tag")

            # Join user details
            req_u = await db.users.find_one({"user_id": doc.get("requested_by")})
            from_u = await db.users.find_one({"user_id": doc.get("from_user")})
            to_u = await db.users.find_one({"user_id": doc.get("to_user")})

            doc["requested_by_name"] = req_u.get("name") if req_u else "System"
            doc["from_user_name"] = from_u.get("name") if from_u else "Unassigned"
            doc["to_user_name"] = to_u.get("name") if to_u else "Unknown"

            transfers.append(doc)
        return {"success": True, "transfers": transfers}

    @staticmethod
    async def resolve_transfer(transfer_id: str, approve_in: ApproveTransfer, approve: bool, resolver_id: str):
        transfer = await db.transfers.find_one({"transfer_id": transfer_id})
        if not transfer:
            raise HTTPException(status_code=404, detail="Transfer request not found")

        if transfer.get("status") != "Requested":
            raise HTTPException(status_code=400, detail="Transfer request is already resolved")

        # Load details
        asset = await db.assets.find_one({"asset_id": transfer["asset_id"]})
        to_user = await db.users.find_one({"user_id": transfer["to_user"]})

        status_str = "Approved" if approve else "Rejected"

        # Update transfer request
        await db.transfers.update_one(
            {"transfer_id": transfer_id},
            {
                "$set": {
                    "status": status_str,
                    "approved_by": resolver_id,
                    "resolved_at": datetime.utcnow(),
                    "resolver_notes": approve_in.notes
                }
            }
        )

        if approve:
            # 1. Close current allocation if active
            current_alloc = await db.allocations.find_one(
                {"asset_id": transfer["asset_id"], "status": {"$in": ["Active", "Overdue"]}}
            )
            if current_alloc:
                await db.allocations.update_one(
                    {"allocation_id": current_alloc["allocation_id"]},
                    {
                        "$set": {
                            "actual_return_date": datetime.utcnow(),
                            "return_condition": "Good",
                            "return_notes": "Transferred out via approved workflow request.",
                            "status": "Returned"
                        }
                    }
                )

            # 2. Create new allocation
            allocation_id = str(uuid4())
            new_alloc = {
                "allocation_id": allocation_id,
                "asset_id": transfer["asset_id"],
                "allocated_to": transfer["to_user"],
                "allocated_by": resolver_id,
                "department_id": to_user.get("department_id"),
                "allocated_at": datetime.utcnow(),
                "expected_return_date": None,
                "actual_return_date": None,
                "return_condition": None,
                "return_notes": None,
                "status": "Active",
                "notes": f"Reallocated from transfer request: {transfer_id}"
            }
            await db.allocations.insert_one(new_alloc)

            # 3. Update asset allocation department/status
            await db.assets.update_one(
                {"asset_id": transfer["asset_id"]},
                {
                    "$set": {
                        "status": "Allocated",
                        "department_id": to_user.get("department_id"),
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            # Notify recipient
            await notify_user(
                transfer["to_user"],
                "TRANSFER_APPROVED",
                "Asset Transferred to You",
                f"Asset '{asset.get('name')}' ({asset.get('asset_tag')}) has been successfully transferred to you."
            )

        # Notify requester
        await notify_user(
            transfer["requested_by"],
            "TRANSFER_RESOLVED",
            f"Transfer Request {status_str}",
            f"Your transfer request for asset '{asset.get('name')}' ({asset.get('asset_tag')}) has been {status_str.lower()}."
        )

        await log_activity(resolver_id, f"RESOLVE_TRANSFER_{status_str.upper()}", "ASSET", transfer["asset_id"], details=approve_in.notes)
        return {"success": True, "message": f"Transfer successfully {status_str.lower()}"}
