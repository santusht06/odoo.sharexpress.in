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

from fastapi import APIRouter, Depends
from models.user_model import RoleEnum, UpdateRole, UpdateDepartment
from controllers.employee_controller import EmployeeController
from utils.rbac import require_admin, require_asset_manager

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("")
async def list_employees(user=Depends(require_asset_manager)):
    return await EmployeeController.list_employees()


@router.patch("/{employee_id}/role")
async def promote_role(employee_id: str, role_in: UpdateRole, user=Depends(require_admin)):
    return await EmployeeController.promote_role(employee_id, role_in, user["user_id"])


@router.patch("/{employee_id}/department")
async def assign_department(employee_id: str, dept_in: UpdateDepartment, user=Depends(require_admin)):
    return await EmployeeController.assign_department(employee_id, dept_in, user["user_id"])


@router.patch("/{employee_id}/toggle-status")
async def toggle_status(employee_id: str, user=Depends(require_admin)):
    return await EmployeeController.toggle_active_status(employee_id, user["user_id"])
