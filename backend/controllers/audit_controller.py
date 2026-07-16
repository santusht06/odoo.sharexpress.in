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

from models.audit_model import CreateAuditCycle, CreateAuditEntry
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
from utils.activity_logger import log_activity

db = get_db()

class AuditController:
    @staticmethod
    async def create_audit_cycle(cycle_in: CreateAuditCycle, actor_id: str):
        # Validate auditors
        for auditor_id in cycle_in.auditors:
            auditor = await db.users.find_one({"user_id": auditor_id})
            if not auditor:
                raise HTTPException(status_code=404, detail=f"Auditor ID {auditor_id} not found")

        cycle_id = str(uuid4())
        new_cycle = {
            "cycle_id": cycle_id,
            "name": cycle_in.name,
            "scope_department": cycle_in.scope_department,
            "scope_location": cycle_in.scope_location,
            "date_range_start": cycle_in.date_range_start,
            "date_range_end": cycle_in.date_range_end,
            "auditors": cycle_in.auditors,
            "status": "Open",
            "created_by": actor_id,
            "created_at": datetime.utcnow(),
            "closed_at": None
        }

        await db.audit_cycles.insert_one(new_cycle)
        new_cycle.pop("_id", None)
        await log_activity(actor_id, "CREATE_AUDIT_CYCLE", "AUDIT", cycle_id, new_value=new_cycle)
        return {"success": True, "cycle": new_cycle}

    @staticmethod
    async def list_audit_cycles():
        cursor = db.audit_cycles.find({}, {"_id": 0}).sort("created_at", -1)
        cycles = []
        async for doc in cursor:
            # Join auditors info
            auditor_names = []
            for auditor_id in doc.get("auditors", []):
                u = await db.users.find_one({"user_id": auditor_id})
                if u:
                    auditor_names.append(u.get("name"))
            doc["auditor_names"] = auditor_names
            cycles.append(doc)
        return {"success": True, "cycles": cycles}

    @staticmethod
    async def get_audit_cycle(cycle_id: str):
        cycle = await db.audit_cycles.find_one({"cycle_id": cycle_id}, {"_id": 0})
        if not cycle:
            raise HTTPException(status_code=404, detail="Audit cycle not found")
        return {"success": True, "cycle": cycle}

    @staticmethod
    async def record_audit_entry(cycle_id: str, entry_in: CreateAuditEntry, auditor_id: str):
        # 1. Verify cycle is Open
        cycle = await db.audit_cycles.find_one({"cycle_id": cycle_id})
        if not cycle:
            raise HTTPException(status_code=404, detail="Audit cycle not found")

        if cycle.get("status") != "Open":
            raise HTTPException(status_code=400, detail="Cannot record entry in a closed audit cycle")

        # 2. Verify auditor is assigned to the cycle (unless Admin)
        auditor_user = await db.users.find_one({"user_id": auditor_id})
        if auditor_user.get("role") != "ADMIN" and auditor_id not in cycle.get("auditors", []):
            raise HTTPException(status_code=403, detail="You are not assigned as an auditor for this cycle")

        # 3. Verify asset exists
        asset = await db.assets.find_one({"asset_id": entry_in.asset_id})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Upsert verification entry
        entry_id = str(uuid4())
        filter_q = {"cycle_id": cycle_id, "asset_id": entry_in.asset_id}
        update_q = {
            "$set": {
                "entry_id": entry_id,
                "auditor_id": auditor_id,
                "result": entry_in.result,
                "notes": entry_in.notes,
                "verified_at": datetime.utcnow()
            }
        }

        await db.audit_entries.update_one(filter_q, update_q, upsert=True)
        await log_activity(auditor_id, "AUDIT_VERIFY_ASSET", "AUDIT", cycle_id, details=f"Asset {asset.get('asset_tag')}: {entry_in.result}")
        return {"success": True, "message": "Verification entry recorded successfully"}

    @staticmethod
    async def get_discrepancy_report(cycle_id: str):
        # Load cycle
        cycle = await db.audit_cycles.find_one({"cycle_id": cycle_id})
        if not cycle:
            raise HTTPException(status_code=404, detail="Audit cycle not found")

        # Select all assets matching scope
        query = {}
        if cycle.get("scope_department"):
            query["department_id"] = cycle["scope_department"]
        if cycle.get("scope_location"):
            query["location"] = cycle["scope_location"]

        assets_in_scope = []
        cursor = db.assets.find(query)
        async for a in cursor:
            assets_in_scope.append(a)

        report_entries = []
        verified_count = 0
        missing_count = 0
        damaged_count = 0
        unverified_count = 0

        for asset in assets_in_scope:
            entry = await db.audit_entries.find_one({"cycle_id": cycle_id, "asset_id": asset["asset_id"]})
            
            result_val = "Unverified"
            notes_val = ""
            auditor_name = None

            if entry:
                result_val = entry["result"]
                notes_val = entry.get("notes", "")
                
                # Gather totals
                if result_val == "Verified":
                    verified_count += 1
                elif result_val == "Missing":
                    missing_count += 1
                elif result_val == "Damaged":
                    damaged_count += 1

                auditor = await db.users.find_one({"user_id": entry["auditor_id"]})
                if auditor:
                    auditor_name = auditor.get("name")
            else:
                unverified_count += 1

            # Join department name
            dept = await db.departments.find_one({"department_id": asset.get("department_id")})
            
            report_entries.append({
                "asset_id": asset["asset_id"],
                "asset_name": asset["name"],
                "asset_tag": asset["asset_tag"],
                "serial_number": asset["serial_number"],
                "current_status": asset["status"],
                "department_name": dept.get("name") if dept else "Unassigned",
                "location": asset["location"],
                "result": result_val,
                "notes": notes_val,
                "auditor_name": auditor_name
            })

        return {
            "success": True,
            "summary": {
                "total_assets": len(assets_in_scope),
                "verified": verified_count,
                "missing": missing_count,
                "damaged": damaged_count,
                "unverified": unverified_count
            },
            "discrepancies": [e for e in report_entries if e["result"] != "Verified"]
        }

    @staticmethod
    async def close_audit_cycle(cycle_id: str, actor_id: str):
        cycle = await db.audit_cycles.find_one({"cycle_id": cycle_id})
        if not cycle:
            raise HTTPException(status_code=404, detail="Audit cycle not found")

        if cycle.get("status") == "Closed":
            raise HTTPException(status_code=400, detail="Audit cycle is already closed")

        # Close cycle
        await db.audit_cycles.update_one(
            {"cycle_id": cycle_id},
            {"$set": {"status": "Closed", "closed_at": datetime.utcnow()}}
        )

        # Enforce business rules on close:
        # Update statuses for missing and damaged assets based on verification results
        entries_cursor = db.audit_entries.find({"cycle_id": cycle_id})
        async for entry in entries_cursor:
            asset_id = entry["asset_id"]
            res = entry["result"]
            
            if res == "Missing":
                await db.assets.update_one(
                    {"asset_id": asset_id},
                    {"$set": {"status": "Lost", "updated_at": datetime.utcnow()}}
                )
            elif res == "Damaged":
                # Mark condition as Poor or raise automatic repair alert
                await db.assets.update_one(
                    {"asset_id": asset_id},
                    {"$set": {"condition": "Poor", "updated_at": datetime.utcnow()}}
                )

        await log_activity(actor_id, "CLOSE_AUDIT_CYCLE", "AUDIT", cycle_id)
        return {"success": True, "message": "Audit cycle closed successfully. Asset statuses updated."}
