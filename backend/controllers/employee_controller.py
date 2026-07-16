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

from models.user_model import RoleEnum, UpdateRole, UpdateDepartment, UpdateUser
from fastapi import HTTPException
from core.database import get_db
from datetime import datetime
from utils.activity_logger import log_activity

db = get_db()

class EmployeeController:
    @staticmethod
    async def list_employees():
        cursor = db.users.find({"deleted_at": None})
        employees = []
        async for doc in cursor:
            # Join department name
            dept_name = None
            if doc.get("department_id"):
                dept = await db.departments.find_one({"department_id": doc["department_id"]})
                if dept:
                    dept_name = dept.get("name")
            
            employees.append({
                "user_id": doc.get("user_id"),
                "name": doc.get("name"),
                "email": doc.get("email"),
                "picture": doc.get("picture"),
                "role": doc.get("role", "EMPLOYEE"),
                "department_id": doc.get("department_id"),
                "department_name": dept_name,
                "is_active": doc.get("is_active", True),
                "is_verified": doc.get("is_verified", False),
                "created_at": doc.get("created_at")
            })
        return {"success": True, "employees": employees}

    @staticmethod
    async def promote_role(employee_id: str, role_in: UpdateRole, actor_id: str):
        employee = await db.users.find_one({"user_id": employee_id, "deleted_at": None})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Admin cannot change their own role to prevent lockout
        if employee_id == actor_id:
            raise HTTPException(status_code=400, detail="Admins cannot change their own role")

        await db.users.update_one(
            {"user_id": employee_id},
            {"$set": {"role": role_in.role, "updated_at": datetime.utcnow()}}
        )

        await log_activity(actor_id, "PROMOTE", "USER", employee_id, details=f"Promoted to role {role_in.role}")
        return {"success": True, "message": f"Role updated successfully to {role_in.role}"}

    @staticmethod
    async def assign_department(employee_id: str, dept_in: UpdateDepartment, actor_id: str):
        employee = await db.users.find_one({"user_id": employee_id, "deleted_at": None})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        dept_id = dept_in.department_id
        if dept_id:
            dept = await db.departments.find_one({"department_id": dept_id})
            if not dept:
                raise HTTPException(status_code=404, detail="Department not found")
        else:
            dept_id = None

        await db.users.update_one(
            {"user_id": employee_id},
            {"$set": {"department_id": dept_id, "updated_at": datetime.utcnow()}}
        )

        await log_activity(actor_id, "ASSIGN_DEPARTMENT", "USER", employee_id, details=f"Assigned to department {dept_id}")
        return {"success": True, "message": "Department assigned successfully"}

    @staticmethod
    async def toggle_active_status(employee_id: str, actor_id: str):
        employee = await db.users.find_one({"user_id": employee_id, "deleted_at": None})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        if employee_id == actor_id:
            raise HTTPException(status_code=400, detail="Admins cannot deactivate themselves")

        current_status = employee.get("is_active", True)
        new_status = not current_status

        await db.users.update_one(
            {"user_id": employee_id},
            {"$set": {"is_active": new_status, "updated_at": datetime.utcnow()}}
        )

        action_str = "ACTIVATE" if new_status else "DEACTIVATE"
        await log_activity(actor_id, action_str, "USER", employee_id, details=f"Toggled active status to {new_status}")
        return {"success": True, "message": f"Employee successfully {action_str.lower()}d"}
