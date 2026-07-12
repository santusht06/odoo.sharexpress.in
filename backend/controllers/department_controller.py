from models.department_model import CreateDepartment, UpdateDepartment, UpdateDepartmentStatus
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from uuid import uuid4
from utils.activity_logger import log_activity

db = get_db()

class DepartmentController:
    @staticmethod
    async def create_department(dept_in: CreateDepartment, actor_id: str):
        # Prevent duplicate names
        existing = await db.departments.find_one({"name": {"$regex": f"^{dept_in.name}$", "$options": "i"}})
        if existing:
            raise HTTPException(status_code=400, detail="Department with this name already exists")

        # Validate parent department if set
        if dept_in.parent_id:
            parent = await db.departments.find_one({"department_id": dept_in.parent_id})
            if not parent:
                raise HTTPException(status_code=404, detail="Parent department not found")

        # Validate head employee if set
        if dept_in.head_id:
            head = await db.users.find_one({"user_id": dept_in.head_id})
            if not head:
                raise HTTPException(status_code=404, detail="Head employee not found")

        dept_id = str(uuid4())
        new_dept = {
            "department_id": dept_id,
            "name": dept_in.name,
            "description": dept_in.description,
            "parent_id": dept_in.parent_id,
            "head_id": dept_in.head_id,
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await db.departments.insert_one(new_dept)
        new_dept.pop("_id", None)
        
        # If head is assigned, make sure they are updated to have this department ID
        if dept_in.head_id:
            await db.users.update_one(
                {"user_id": dept_in.head_id},
                {"$set": {"department_id": dept_id, "role": "DEPARTMENT_HEAD"}}
            )

        await log_activity(actor_id, "CREATE", "DEPARTMENT", dept_id, new_value=new_dept)
        return {"success": True, "department": new_dept}

    @staticmethod
    async def list_departments():
        cursor = db.departments.find({}, {"_id": 0})
        depts = []
        async for doc in cursor:
            # Join head info
            if doc.get("head_id"):
                head = await db.users.find_one({"user_id": doc["head_id"]})
                if head:
                    doc["head_name"] = head.get("name")
                    doc["head_email"] = head.get("email")
            depts.append(doc)
        return {"success": True, "departments": depts}

    @staticmethod
    async def update_department(dept_id: str, dept_in: UpdateDepartment, actor_id: str):
        dept = await db.departments.find_one({"department_id": dept_id})
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

        updates = {}
        if dept_in.name is not None:
            existing = await db.departments.find_one({"name": {"$regex": f"^{dept_in.name}$", "$options": "i"}, "department_id": {"$ne": dept_id}})
            if existing:
                raise HTTPException(status_code=400, detail="Department with this name already exists")
            updates["name"] = dept_in.name
            
        if dept_in.description is not None:
            updates["description"] = dept_in.description
            
        if dept_in.parent_id is not None:
            if dept_in.parent_id == dept_id:
                raise HTTPException(status_code=400, detail="A department cannot be its own parent")
            if dept_in.parent_id != "":
                parent = await db.departments.find_one({"department_id": dept_in.parent_id})
                if not parent:
                    raise HTTPException(status_code=404, detail="Parent department not found")
                updates["parent_id"] = dept_in.parent_id
            else:
                updates["parent_id"] = None

        if dept_in.head_id is not None:
            if dept_in.head_id != "":
                head = await db.users.find_one({"user_id": dept_in.head_id})
                if not head:
                    raise HTTPException(status_code=404, detail="Head employee not found")
                updates["head_id"] = dept_in.head_id
                
                # Make head a department head role + assign dept
                await db.users.update_one(
                    {"user_id": dept_in.head_id},
                    {"$set": {"department_id": dept_id, "role": "DEPARTMENT_HEAD"}}
                )
            else:
                # Remove previous head
                if dept.get("head_id"):
                    await db.users.update_one(
                        {"user_id": dept["head_id"]},
                        {"$set": {"role": "EMPLOYEE"}}
                    )
                updates["head_id"] = None

        if updates:
            updates["updated_at"] = datetime.utcnow()
            await db.departments.update_one({"department_id": dept_id}, {"$set": updates})
            await log_activity(actor_id, "UPDATE", "DEPARTMENT", dept_id, previous_value=dept, new_value=updates)

        return {"success": True, "message": "Department updated successfully"}

    @staticmethod
    async def change_status(dept_id: str, status_in: UpdateDepartmentStatus, actor_id: str):
        dept = await db.departments.find_one({"department_id": dept_id})
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

        if status_in.status not in ["Active", "Inactive"]:
            raise HTTPException(status_code=400, detail="Invalid status")

        await db.departments.update_one(
            {"department_id": dept_id},
            {"$set": {"status": status_in.status, "updated_at": datetime.utcnow()}}
        )
        await log_activity(actor_id, "UPDATE_STATUS", "DEPARTMENT", dept_id, details=f"Changed status to {status_in.status}")
        return {"success": True, "message": f"Department status changed to {status_in.status}"}
