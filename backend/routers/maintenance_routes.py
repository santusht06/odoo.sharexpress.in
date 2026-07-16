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

from fastapi import APIRouter, Depends, Query
from models.maintenance_model import CreateMaintenance, AssignTechnician, ResolveMaintenance
from controllers.maintenance_controller import MaintenanceController
from utils.rbac import require_asset_manager, require_any_authenticated
from typing import Optional

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("")
async def raise_request(maint_in: CreateMaintenance, user=Depends(require_any_authenticated)):
    return await MaintenanceController.raise_request(maint_in, user["user_id"])


@router.get("")
async def list_requests(
    asset_id: Optional[str] = None,
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    user=Depends(require_any_authenticated)
):
    if user["role"] == "EMPLOYEE":
        employee_id = user["user_id"]
    return await MaintenanceController.list_requests(asset_id, employee_id, status)


@router.post("/{request_id}/approve")
async def approve_request(request_id: str, user=Depends(require_asset_manager)):
    return await MaintenanceController.resolve_request_status(request_id, True, user["user_id"])


@router.post("/{request_id}/reject")
async def reject_request(request_id: str, user=Depends(require_asset_manager)):
    return await MaintenanceController.resolve_request_status(request_id, False, user["user_id"])


@router.post("/{request_id}/assign")
async def assign_technician(request_id: str, assign_in: AssignTechnician, user=Depends(require_asset_manager)):
    return await MaintenanceController.assign_technician(request_id, assign_in, user["user_id"])


@router.post("/{request_id}/resolve")
async def resolve_request(request_id: str, resolve_in: ResolveMaintenance, user=Depends(require_asset_manager)):
    return await MaintenanceController.resolve_maintenance(request_id, resolve_in, user["user_id"])
