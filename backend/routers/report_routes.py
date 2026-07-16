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
from fastapi.responses import StreamingResponse
from controllers.report_controller import ReportController
from utils.rbac import require_asset_manager

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/utilization")
async def get_utilization(user=Depends(require_asset_manager)):
    return await ReportController.get_utilization()


@router.get("/idle-assets")
async def get_idle_assets(user=Depends(require_asset_manager)):
    return await ReportController.get_idle_assets()


@router.get("/maintenance-frequency")
async def get_maintenance_frequency(user=Depends(require_asset_manager)):
    return await ReportController.get_maintenance_frequency()


@router.get("/department-allocation")
async def get_department_allocation(user=Depends(require_asset_manager)):
    return await ReportController.get_department_allocation()


@router.get("/booking-heatmap")
async def get_booking_heatmap(user=Depends(require_asset_manager)):
    return await ReportController.get_booking_heatmap()


@router.get("/retirement")
async def get_nearing_retirement(user=Depends(require_asset_manager)):
    return await ReportController.get_nearing_retirement()


@router.get("/export")
async def export_report(
    type: str = Query("assets", enum=["assets", "allocations", "maintenance", "bookings"]),
    user=Depends(require_asset_manager)
):
    csv_data = await ReportController.export_csv(type)
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={type}_report.csv"}
    )

