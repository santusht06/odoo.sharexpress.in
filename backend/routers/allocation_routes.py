from fastapi import APIRouter, Depends, Query
from models.allocation_model import CreateAllocation, ReturnAsset
from controllers.allocation_controller import AllocationController
from utils.rbac import require_asset_manager, require_any_authenticated
from typing import Optional

router = APIRouter(prefix="/allocations", tags=["Allocations"])

@router.post("")
async def allocate_asset(alloc_in: CreateAllocation, user=Depends(require_asset_manager)):
    return await AllocationController.allocate_asset(alloc_in, user["user_id"])


@router.get("")
async def list_allocations(
    status: Optional[str] = None,
    employee_id: Optional[str] = None,
    user=Depends(require_any_authenticated)
):
    # If the user is an employee, they can only see their own allocations
    if user["role"] == "EMPLOYEE":
        employee_id = user["user_id"]
    return await AllocationController.list_allocations(status, employee_id)


@router.post("/{allocation_id}/return")
async def return_asset(allocation_id: str, return_in: ReturnAsset, user=Depends(require_asset_manager)):
    return await AllocationController.return_asset(allocation_id, return_in, user["user_id"])
