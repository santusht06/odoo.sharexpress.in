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
from models.department_model import CreateDepartment, UpdateDepartment, UpdateDepartmentStatus
from controllers.department_controller import DepartmentController
from utils.rbac import require_admin, require_any_authenticated

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.post("")
async def create_department(dept_in: CreateDepartment, user=Depends(require_admin)):
    return await DepartmentController.create_department(dept_in, user["user_id"])


@router.get("")
async def list_departments(user=Depends(require_any_authenticated)):
    return await DepartmentController.list_departments()


@router.patch("/{dept_id}")
async def update_department(dept_id: str, dept_in: UpdateDepartment, user=Depends(require_admin)):
    return await DepartmentController.update_department(dept_id, dept_in, user["user_id"])


@router.patch("/{dept_id}/status")
async def change_status(dept_id: str, status_in: UpdateDepartmentStatus, user=Depends(require_admin)):
    return await DepartmentController.change_status(dept_id, status_in, user["user_id"])
